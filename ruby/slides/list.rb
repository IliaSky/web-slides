class List < Slim::Filter
  def line_replace(line)
      line = line.gsub(/`(.*?)`/, '<code>\1</code>')

      # [github:user/repo]
      line = line.gsub(/\[github:([^\]]*?)\]/, '[\1](https://github.com/\1)')

      # [text](url)
      line = line.gsub(/\[([^\]]+)\]\((\S+?)\)/, '<a href="\2">\1</a>')
  end

  def on_slim_embedded(engine, body)
    code = Slim::CollectText.new.call(body)
    items = code.lines.map do |line|
      %{<li class="action">#{line_replace line}</li>}
    end
    html = "<ul>#{items.join}</ul>"
    [:static, html]
  end
end
