#DECOのWebシステムのセットアップ

すごい災害訓練DECO用Webシステム・アプリケーション開発
##Webシステム画面（本部用移動軌跡表示システム）

#動作確認済み環境
##サーバーサイド
・Ubuntu 14.04  
・Ruby2.2.1  
・Apache2.4.7 + Passenger  
・sinatra1.4.6  

##クライアントサイド
・MacOSX 10.11.3  
・Google Chrome 47.0.2526.111 (64-bit)  


##動作環境
・Ubuntu 14.04.3  
・Ruby 2.2.1  
・Apache 2.4.7  

#インフラ環境の設定
##rbenv をインストール

1.必要なパッケージのインストール

```bash
$ sudo apt-get install build-essential bison libreadline6-dev curl git-core zlib1g-dev libssl-dev libyaml-dev libsqlite3-dev sqlite3 libxml2-dev libxslt1-dev autoconf libncurses5-dev libffi-dev
```
2.gitでrbenv,ruby-buildをダウンロード(clone)

```bash
$ cd
$ git clone https://github.com/sstephenson/rbenv.git ~/.rbenv
$ git clone https://github.com/sstephenson/ruby-build.git ~/.rbenv/plugins/ruby-build

```
3.もろもろの設定

```bash
$ vi ~/.bashrc
--下の内容を書く--
export PATH="$HOME/.rbenv/bin:$PATH"
eval "$(rbenv init -)"
----

$ source ~/.bashrc
```
4.Ruby2.2.1をインストール

```bash
$ rbenv install 2.2.1
$ rbenv versions
$ rbenv rehash
$ rbenv global 2.2.1
```
5.apacheにpassengerモジュールをインストール

```bash
$ gem install bundler
$ gem install passenger
$ passenger-install-apache2-module

```
Bundlerとは・・・Gemfileに記載されたパッケージの種類・バージョンのものをインストールするための仕組み。
Phusion Passengerとは・・・RailsをApache上で動かすためのモジュール

6.passenger-install-apache2-moduleのエラーメッセージででてきた部分のインストール

```bash
$ passenger-install-apache2-module

Installation instructions for required software

 * To install Curl development headers with SSL support:
   Please run apt-get install libcurl4-openssl-dev or libcurl4-gnutls-dev, whichever you prefer.

 * To install Apache 2 development headers:
   Please install it with apt-get install apache2-threaded-dev

 * To install Apache Portable Runtime (APR) development headers:
   Please install it with apt-get install libapr1-dev

 * To install Apache Portable Runtime Utility (APU) development headers:
   Please install it with apt-get install libaprutil1-dev

$ sudo apt-get install libcurl4-openssl-dev
$ sudo apt-get install apache2-threaded-dev
$ sudo apt-get install libapr1-dev

```

7.インストールがうまくいったら、最後にでてくるメッセージをコピー

```bash
Please edit your Apache configuration file, and add these lines:

LoadModule passenger_module /home/komiya/.rbenv/versions/2.2.1/lib/ruby/gems/2.2.0/gems/passenger-5.0.23/buildout/apache2/mod_passenger.so
   <IfModule mod_passenger.c>
     PassengerRoot /home/komiya/.rbenv/versions/2.2.1/lib/ruby/gems/2.2.0/gems/passenger-5.0.23
     PassengerDefaultRuby /home/komiya/.rbenv/versions/2.2.1/bin/ruby
   </IfModule>

After you restart Apache, you are ready to deploy any number of web
applications on Apache, with a minimum amount of configuration!

Press ENTER when you are done editing.
```

8.GitHubからsuper-emergency-drill-mapをClone

```bash
$ cd /var/www/html
$ sudo git clone https://github.com/sugoiDECO/super-emergency-drill-map.git
```

##Apacheの設定

```bash
$ cd /etc/apache2/mods-available
$ sudo vi passenger.conf

#LoadModuleの設定
LoadModule passenger_module /home/komiya/.rbenv/versions/2.2.1/lib/ruby/gems/2.2.0/gems/passenger-5.0.23/buildout/apache2/mod_passenger.so
   <IfModule mod_passenger.c>
     PassengerRoot /home/komiya/.rbenv/versions/2.2.1/lib/ruby/gems/2.2.0/gems/passenger-5.0.23
     PassengerDefaultRuby /home/komiya/.rbenv/versions/2.2.1/bin/ruby
   </IfModule>


$ cd ../
$ cd site-available/
$ sudo vi deco_osaka.conf

#バーチャルホストの設定
<VirtualHost *:80>
     ServerName deco.cerd.osaka-cu.ac.jp
     # !!! Be sure to point DocumentRoot to 'public'!
     DocumentRoot /var/www/html/super-emergency-drill-map/public
     <Directory /var/www/html/super-emergency-drill-map/public>
        # This relaxes Apache security settings.
        AllowOverride all
        # MultiViews must be turned off.
        Options -MultiViews
     </Directory>
  </VirtualHost>

$ sudo a2ensite deco_osaka
$ sudo apachectl restart


```bash
http://www.yamamo10.jp/yamamoto/comp/home_server/ubuntu_server/apache/index.php

Apacheがうまく起動せずエラーがでた場合

```bash
$ sudo a2ensite deco-osaka
$ sudo vi ../apache2.conf

#下記の内容を追記
ServerName deco.cerd.osaka-cu.ac.jp

$ sudo apachectl restart

```

http://www.yamamo10.jp/yamamoto/comp/home_server/ubuntu_server/apache/index.php

Bundlerでのインストール
この時のポイントは、Bundleのある場所をWhich bundle で確認する。

```bash
$ /home/vagrant/.rbenv/shims/bundle install --path vendor/bundle 
```


##Webシステム画面
システムは、訓練本部で使用する Webシステムを示す。機能としては以下の通りである。
・DECO用アプリから送られてくる位置情報を元に、Webマップ上に訓練参加者の位置や行動履歴をのリアルタイム表示
・DECO用アプリから送られてくる情報を受信する

![Kobito.WluB8m.png](https://qiita-image-store.s3.amazonaws.com/0/45482/8918d90c-926b-8ab5-2faa-51d46de0a569.png "Kobito.WluB8m.png")


