#!/usr/bin/env python
# -*- coding: utf-8 -*-

import tornado.httpserver
import tornado.httpclient
import tornado.ioloop
import tornado.web

import os
import os.path
import time
from optparse import OptionParser
import json
import smtplib
from email.mime.text import MIMEText



class Config:
    discov_url = ''
    ego_url_prefix = ''
    website_url_prefix = ''
    agentid = ''
    agent_url_private = ''
    agent_url = ''
    
class website_call(tornado.web.RequestHandler):
    def get(self):
        self.start_time = time.time()
        self.callback = self.get_argument("callback", None)
        self.render("%s.html" % self.path, config=config)
        
    def prepare(self):
        path = self.request.path.split('/')
        self.path = path[1] or 'index'
        
        
class serve_user(tornado.web.RequestHandler):
    @tornado.web.asynchronous
    def get(self):
        path = self.request.uri.split('/')[1:]
        if path[0] == 'a':
            self.secret = path[1]
            http_client = tornado.httpclient.AsyncHTTPClient()
            http_client.fetch("%s/authenticate_admin_secret?secret=%s" % (config.ego_url_prefix, self.secret), self.evaluate_agentid_clb)
        else:
            self.agentid = path[0]
            if self.agentid[-1] == '?': self.agentid = self.agentid[:-1]
            self.examine_cookie()
        
    def examine_cookie(self):
        cookie = self.get_cookie('bringy')
        try:
            cookie_dic = json.loads(tornado.escape.url_unescape(cookie))
        except:
            cookie_dic = {}
            print '*** serve_user get: error parsing cookie: %s' % cookie
        
        if self.agentid in cookie_dic.get('pseudonyms',{}):
            self.secret = cookie_dic['pseudonyms'][self.agentid]
            print 'secret in cookie', self.secret
        else:
            self.secret = ''
            print '*** serve_user get: Illegal attempt to access %s' % self.agentid
        
        http_client = tornado.httpclient.AsyncHTTPClient()
        http_client.fetch("%s/%s" % (config.ego_url_prefix, self.agentid), self.evaluate_secret_clb)
    
    def evaluate_secret_clb(self, response):
        try:
            dic = json.loads(response.body)
        except:
            error = '*** serve_user clb: error parsing json: %s' % response.body
            dic = dict(error=error)
        
        if dic.get('error'):
            print dic['error']
            self.redirect('/')
            return
        self.finish_call()
            
    def evaluate_agentid_clb(self, response):
        try:
            dic = json.loads(response.body)
        except:
            error = '*** serve_user clb: error parsing json: %s' % response.body
            dic = dict(error=error)
        
        if dic.get('error') and not dic.get('user'):
            print dic['error']
            self.redirect('/')
            return
        self.agentid = dic['user']
        
        self.finish_call()
        
    def finish_call(self):
        config.agentid = self.agentid
        config.agent_url = '%s/%s' % (config.website_url_prefix, self.agentid)
        config.agent_url_private = '%s/%s' % (config.website_url_prefix, self.agentid)
        config.secret = self.secret
        
        if self.secret:
            config.agent_url_private = '%s/a/%s' % (config.website_url_prefix, self.secret)
        else:
            config.agent_url_private = "<not available>"
        
        self.render("manage.html", config=config)


class message(tornado.web.RequestHandler):
    def post(self):
        you = self.get_argument('to')
        secret = self.get_argument('secret')
        user = self.get_argument('user')
        ip = self.request.headers.get('X-Real-Ip')
        
        if not you or not secret or not user:
            self.write(dict(error='missing parameter'))
        
        import redis
        r = redis.Redis(host='localhost', port=6379, db=0)
        r.sadd('adminemails', '%s:%s:%s' % (user,you,ip))
        
        message = 'Hello,\n\n'
        message+= 'You received this message because someone (probably you) emailed to you the "admin URL" for user "%s" on Brin.gy:\n\n' % user
        message+= 'http://brin.gy/a/%s\n\n' % secret
        message+= 'You can use the above URL to manage your pseudonym.\n\n'
        message+= 'Cheers\nBrin.gy\n\nPS: IP address that was used: %s' % ip
        
        me = 'info@brin.gy'
        msg = MIMEText(message)
        msg['Subject'] = 'Your "%s" pseudonym' % user
        msg['From'] = 'Brin.gy <%s>' % me
        msg['To'] = you

        LOGIN = 'info@brin.gy'
        PASSWD = open('email.pwd').read()
        
        error = ''
        s = smtplib.SMTP('smtp.gmail.com', 587)
        s.ehlo()
        s.starttls()
        try:
            s.login(LOGIN, PASSWD)
            s.sendmail(me, [you], msg.as_string())
            s.quit()
        except Exception,e:
            error = '%s'%e
        self.write(dict(error=error, to=you))
        if not self._finished:
            self.finish()
        

debug = os.environ.get("SERVER_SOFTWARE", "").startswith("Development/")

settings = {
    "template_path": os.path.join(os.path.dirname(__file__), "templates"),
    "cookie_secret": "61oETzKXQAGaYdkL5gEmGeJJFuYh7EQnp2XdTP1o/Vo=",
    "xsrf_cookies": True,
    "debug": debug,
    "static_path": os.path.join(os.path.dirname(__file__), "static"),
    "static_url_prefix": '/static/'
}

application = tornado.web.Application([
    (r"/", website_call),
    (r"/api", website_call),
    (r"/about", website_call),
    (r"/UROP", website_call),
    (r"/message", message),
    
    (r"/a/[a-zA-Z0-9]+/?$", serve_user),
    (r"/[a-zA-Z0-9]+/?$", serve_user),
], **settings)

if __name__ == "__main__":
    
    config = Config()
    
    parser = OptionParser(add_help_option=False)
    parser.add_option("-h", "--host", dest="host", default='localhost')
    parser.add_option("-p", "--port", dest="port", default='8889')
    
    parser.add_option("-w", "--websiteurl", dest="website_url")
    parser.add_option("-d", "--discovurl", dest="discov_url")
    parser.add_option("-a", "--agentsurl", dest="agents_url")
    (options, args) = parser.parse_args()
    
    PORT = int(options.port)
    HOST = options.host
    
    website_url = 'http://%s:%s' % (HOST, PORT)
    discov_url = 'http://%s:22222' % HOST
    agents_url = 'http://%s:10007' % HOST
    
    if (options.discov_url):
        discov_url = 'http://%s' % options.discov_url
    if (options.agents_url):
        agents_url = 'http://%s' % options.agents_url
        
    config.website_url_prefix = website_url
    config.discov_url = discov_url
    config.ego_url_prefix = agents_url
    
    print 'Brin.gy website running at %s' % website_url
    print 'Discovery at: %s' % discov_url
    print 'Agents at: %s' % agents_url
    


    http_server = tornado.httpserver.HTTPServer(application)
    http_server.listen(PORT, address=HOST)
    tornado.ioloop.IOLoop.instance().start()
