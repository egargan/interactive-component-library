import { VectorLayerRenderer } from "../renderers/VectorLayerRenderer"
import { Style, Stroke } from "../styles"
import { combineExtents } from "../util/extent"
import { Dispatcher, MapEvent } from "../events"
import { VectorSource } from "../sources/VectorSource"
import { useEffect, useContext } from "preact/hooks"
import { MapContext } from "$molecules/canvas-map/context/MapContext"

/** @typedef {Omit<ConstructorParameters<typeof VectorLayer>[0], "source">} VectorLayerOptions */
/** @typedef {VectorLayerOptions & { features: import("../Feature").Feature[] }} VectorLayerComponentProps */

export class VectorLayer {
  /** @param {VectorLayerComponentProps} props */
  static Component({ features, ...options }) {
    const { map } = useContext(MapContext)

    useEffect(() => {
      if (!map) return

      const controller = VectorLayer.with(features, options)
      map.addLayer(controller)

      return () => {
        map.removeLayer(controller)
      }
    }, [map, features, options])

    return null
  }

  /**
   * @param {import("../Feature").Feature[]} features
   * @param {VectorLayerOptions} options
   */
  static with(features, options) {
    const source = new VectorSource({ features })
    return new VectorLayer({ source, ...options })
  }

  /**
   * @param {Object} params
   * @param {VectorSource} params.source
   * @param {Style} [params.style=undefined]
   * @param {number} [params.minZoom=0]
   * @param {number} [params.opacity=1]
   * @param {boolean} [params.hitDetectionEnabled=false]
   */
  constructor({
    source,
    style,
    minZoom = 0,
    opacity = 1,
    hitDetectionEnabled = true,
  }) {
    this.dispatcher = new Dispatcher(this)
    this.renderer = new VectorLayerRenderer(this)
    this.source = source
    this._style = style
    this.minZoom = minZoom
    this.opacity = opacity
    this.hitDetectionEnabled = hitDetectionEnabled
  }

  get source() {
    return this._source
  }

  set source(source) {
    if (this._source && source !== this._source) {
      this._source.tearDown()
    }
    this._source = source

    source.on(MapEvent.CHANGE, () => {
      this._extent = null
      this.dispatcher.dispatch(MapEvent.CHANGE)
    })
  }

  setRawProjection(projection) {
    this.projection = projection
  }

  tearDown() {
    this.dispatcher = null
  }

  get style() {
    if (this._style) return this._style

    // create default vector style
    const defaultStyle = new Style({
      stroke: new Stroke(),
    })
    return defaultStyle
  }

  set style(style) {
    this._style = style
    this.dispatcher.dispatch(MapEvent.CHANGE)
  }

  getStyleFunction() {
    const style = this.style
    if (typeof style === "function") return style
    return () => {
      return style
    }
  }

  getExtent() {
    if (this._extent) return this._extent

    const features = this.source.getFeatures()
    const extent = features.reduce((combinedExtent, feature) => {
      const featureExtent = feature.getExtent()
      if (!combinedExtent) return featureExtent
      return combineExtents(featureExtent, combinedExtent)
    }, null)
    this._extent = extent
    return extent
  }

  findFeatures(coordinate) {
    if (!this.hitDetectionEnabled) return
    return this.source.getFeaturesAtCoordinate(coordinate)
  }

  renderFrame(frameState, targetElement) {
    return this.renderer.renderFrame(frameState, targetElement)
  }
}
