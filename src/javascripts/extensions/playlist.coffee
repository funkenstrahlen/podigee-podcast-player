$ = require('jquery')
_ = require('lodash')
sightglass = require('sightglass')
rivets = require('rivets')

class PlaylistItem
  constructor: (context, callback) ->
    @context = context
    @callback = callback

  render: =>
    @elem = $(@defaultHtml)
    rivets.bind(@elem, @context)

    @elem.data('item', @context)
    @elem.on('click', 'img, span', @context, @callback)

    return @elem

  defaultHtml:
    """
    <li>
      <a pp-if="href" pp-href="href" target="_blank"><i class="fa fa-link"></i></a>
      <span>{ title }</span>
    </li>
    """

class Playlist
  @extension:
    name: 'Playlist'
    type: 'panel'

  constructor: (@app) ->
    @feed = @app.podcast.feed
    return unless @feed

    @options = _.extend(@defaultOptions, @app.extensionOptions.Playlist)

    @feed.promise.done =>
      @renderPanel()
      @renderButton()

      @app.renderPanel(this)
      @app.togglePanel(@panel) if @options.showOnStart

  defaultOptions:
    showOnStart: false

  click: (event) =>
    item = event.data
    @app.episode.title = item.title
    @app.episode.subtitle = item.subtitle
    @app.episode.description = item.description
    @app.episode.playlist.mp3 = item.enclosure

  renderButton: =>
    @button = $(@buttonHtml)
    @button.on 'click', =>
      @app.togglePanel(@panel)

  renderPanel: =>
    @panel = $(@panelHtml)

    list = @panel.find('ul')
    $(@feed.items).each((index, feedItem) =>
      item = $(feedItem)
      item = {
        title: item.find('title').html(),
        subtitle: item.find('subtitle').html(),
        href: item.find('link').html(),
        enclosure: item.find('enclosure').attr('url'),
        description: item.find('description').html()
        cover_url: item.find
      }
      playlistItem = new PlaylistItem(item, @click).render()
      list.append(playlistItem)
    )

    @panel.hide()

  buttonHtml:
    """
    <button class="fa fa-bookmark playlist-button" title="Show playlist"></button>
    """

  panelHtml:
    """
    <div class="playlist">
      <h3>Playlist</h3>

      <ul></ul>
    </div>
    """

module.exports = Playlist