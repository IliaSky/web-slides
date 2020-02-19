class Example < Slim::Filter
  def on_slim_embedded(engine, body)
    code = Slim::CollectText.new.call(body)
    pattern = /\[lang\:(.*)\]/
    lang = :php
    if code =~ pattern
      lang = $1.to_sym
    end
    code = code.gsub pattern, ''
    html = Rouge.highlight code, lang, 'html'
    html = '<pre class="highlight">' + html + '</pre>'
    [:static, html]
  end
end
