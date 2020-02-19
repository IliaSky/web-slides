# encoding: utf-8
class Lecture
  LAYOUT_FILE = 'layout.slim'

  attr_reader :title, :slug, :slides_html

  def initialize(input, title)
    @title = title
    @slides_html = generate_html input
  end

  def render
    Slim::Template.new(LAYOUT_FILE).render(self)
  end

  private

  def generate_html(input)
    Slim::Template.new { input }.render(SlideHelper.new)
  end
end
