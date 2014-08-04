require 'sinatra'
require "sinatra/reloader" if development?
require 'haml'
require 'open-uri'

configure do
  #Haml::Template.options[:format] = :html5
  mime_type :json, 'application/json'
end

get '/' do
  haml :index
end

get '/issues.json' do
  num = params[:num] || "100"
  offset = params[:offset] || "0"
  content_type :json
  open("http://beta.shirasete.jp/projects/57/issues.json?limit=100&offset=#{offset}").read
end

get '/issues/:id.json' do
  issue_id = params[:id]
  content_type :json
  open("http://beta.shirasete.jp/issues/#{issue_id}.json?include=attachments")
end

get '/tasks.json' do
  tid = params[:task_id];
  content_type :json
  open("http://beta.shirasete.jp/projects/56/issues.json?assigned_to_id=#{tid}").read
end

