# Jekyll JSON generator (23/05/2015)
# https://github.com/jgarber623/sixtwothree.org/blob/master/src/_plugins/json_page_generator.rb
#
# Generates JSON data for all posts
module Jekyll
  class JSONPage < Page
    def initialize(site, base, dir, name, content)
      @site = site
      @base = base
      @dir  = dir
      @name = name

      self.data = {}
      self.content = content

      process(@name)
    end

    def read_yaml(*)
      # Do nothing
    end

    def render_with_liquid?
      false
    end
  end

  class JSONPostGenerator < Generator
    safe true

    def generate(site)
      site.posts.each do |post|
        # Set the path to the JSON version of the post
        dest = site.config['destination']

        path = post.destination(dest)
        path["#{dest}/"] = ''
        path['/index.html'] = '.json'

        # Convert the post to a hash
        output = post.to_liquid

        # Prepare the output for JSON conversion
        ['dir', 'layout', 'path'].each do |key|
          output.delete(key)
        end

        output['content'] = post.transform
        output['next'] = [output['next'].id, output['next'].title] unless output['next'].nil?
        output['previous'] = [output['previous'].id, output['previous'].title] unless output['previous'].nil?

        site.pages << JSONPage.new(site, site.source, File.dirname(path), File.basename(path), output.to_json)
      end
    end
  end
end
