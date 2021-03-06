require 'govspeak'

Govspeak::Document.extension('calculator', %r(^{::calculator\sid="(?<id>.*?)"\s/})) do |id|
  classes = "t-calculator calculator calculator--in-article calculator--#{id} js-calculator hide-from-print"
  partial = "calculators/#{id.tr('-', '_')}/form"

  calculator = ApplicationController.new.render_to_string(partial: partial)

  %(\n\n<div class="#{classes}">#{calculator}</div>\n)
end

# Example:
#   {::yes-no-dont-know-question id="pension_type_question_1"}
#   ## Was your pension set up by your employer?
#   {:/yes-no-dont-know-question}
#
# partial_name = yes-no-dont-know-question
# id = pension_type_question_1
# header = '## Was your pension set up by your employer?'
regexp = %r${::(?<partial_name>[^\s]+-question)\sid="(?<id>.*?)"}(?<header>.*){:/\k<partial_name>}$m
Govspeak::Document.extension('multi-choice-questions', regexp) do |partial_name, id, header|
  partial = "questions/#{partial_name.tr('-', '_')}"

  ApplicationController.new.render_to_string(
    partial: partial,
    locals: {
      id: id,
      header: Govspeak::Document.new(header.strip).to_html.html_safe # rubocop:disable Rails/OutputSafety
    }
  )
end
