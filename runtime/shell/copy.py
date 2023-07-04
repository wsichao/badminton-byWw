#!/usr/local/bin/python2.7
# -*- coding: utf-8 -*-:

import commands

from Tkinter import *
import tkMessageBox


modular_runtime = '/Users/Mr.Carry/Desktop/webstore_app/modular/runtime'

docchat_backend = '/Users/Mr.Carry/Desktop/webstore_app/DocChat-backend/runtime'

# print __file__.replace('/shell/copy.py','')

class Application(Frame):
    def __init__(self, master=None):
        Frame.__init__(self, master)
        self.pack()
        self.createWidgets()

    def createWidgets(self):
        self.helloLabel = Label(self, text='modular runtime 同步到 DocChatBackend runtime')
        self.helloLabel.pack()
        self.quitButton = Button(self, text='开始同步', command=self.modularToDocChatBackend)
        self.quitButton.pack()

    def modularToDocChatBackend(self):
        command = 'cp -R {0}/* {1}'.format(modular_runtime,docchat_backend)
        commands.getoutput(command)
        tkMessageBox.showinfo('Message','同步成功')

app = Application()
# 设置窗口标题:
app.master.title('runtime 同步工具')
# 主消息循环:
app.mainloop()