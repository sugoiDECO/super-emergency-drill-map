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
  content_type :json
  open('http://beta.shirasete.jp/issues.json?project_id=14&sort=updated_on:desc&offset=0&limit=100').read
end

get '/issues/:id.json' do
  issue_id = params[:id]
  content_type :json
  open("http://beta.shirasete.jp/issues/#{issue_id}.json?include=attachments")
end

