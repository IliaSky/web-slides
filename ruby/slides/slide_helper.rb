class SlideHelper
  def escape(html)
    Temple::Utils.escape_html html
  end

  def slide(title, subtitle = nil)
    output = ''
    output << "<section>\n"
    output << "<h1>#{escape title}</h1>"
    output << "<h2>#{escape subtitle}</h2>" unless subtitle.nil?
    output << yield
    output << "</section>\n"
    output
  end

  def github_repo(repo)
    %{<a href="http://github.com/#{repo}">#{repo}</a>}
  end
end

