use Rack::Static,
  :urls => ["/js", "/files/css", "/files/music"],
  :root => "deploy"

run lambda { |env|
  [
    200,
    {
      'Content-Type'  => 'text/html',
      'Cache-Control' => 'public, max-age=86400'
    },
    File.open('deploy/index.html', File::RDONLY)
  ]
}