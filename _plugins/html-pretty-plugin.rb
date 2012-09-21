# Copyright (C) 2012 Benjamin Feng
#
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in all
# copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
# SOFTWARE.


module HtmlPretty
  # Not a real parser.  Only detects start/end tags maybe correctly...
  # Requires XML syntax (close all tags)
  # Self rolled because other prettifiers have weird problems
  def self.fake_tidy(html)
    html = html.gsub(/^\s+/, '')        # quash opening whitespace
    html = html.gsub(/\s+$/, '')        # quash closing whitespace
    html = html.gsub(/\n+/, "\n")       # quash blank lines
    html = html.gsub(/[ \t]+/, ' ')     # collapse all whitespace
    html = html.gsub(/< +/, '<')        # remove whitespace from start bracket
    html = html.gsub(/ +>/, '>')        # remove whitespace from end bracket

    indent = 0
    html.map do |line|
      if line.start_with?('<!') || line =~ /<html.*ie/
        line                            # Comments should have no alignment
      elsif line.start_with?('</')
        indent -= 1
        "  " * indent + line
      elsif line.end_with?("/>\n") ||   # <self-close />
            line =~ /<\/[^>]*>/ ||      # <tail>end</tail>
            line !~ /</                 # simple line
        "  " * indent + line
      else
        indent += 1
        val = "  " * (indent - 1) + line
      end
    end.join
  end
end

if defined?(Jekyll)
  module Jekyll
    class Page
      alias_method :old_output, :output
      def output
        ext =~ /.html$/ ? ::HtmlPretty.fake_tidy(old_output) : old_output
      end
    end
  end
end
