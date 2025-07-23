<template>
  <ol-map
    ref="mapRef"
    :loadTilesWhileAnimating="true"
    :loadTilesWhileInteracting="true"
    style="height: 100%"
  >
    <ol-view ref="view" :center="center" :zoom="zoom" :projection="projection" />

    <ol-tile-layer>
      <ol-source-osm />
    </ol-tile-layer>

    <ol-overlay
      v-if="tooltipCoord"
      :position="tooltipCoord"
      :offset="[0, -15]"
      positioning="bottom-center"
      :stopEvent="false"
      :insertFirst="false"
    >
      <div class="tooltip tooltip-measure">
        {{ tooltipText }}
      </div>
    </ol-overlay>

    <ol-overlay
      v-if="helpTooltipCoord"
      :position="helpTooltipCoord"
      :offset="[0, 15]"
      positioning="top-center"
    >
      <div class="tooltip tooltip-info">
        {{ helpTooltipText }}
      </div>
    </ol-overlay>

    <ol-vector-layer>
      <ol-source-vector>
        <ol-interaction-draw :type="drawType" @drawend="drawend" @drawstart="drawstart" />
      </ol-source-vector>

      <ol-style>
        <ol-style-stroke color="#ffcc33" :width="2" />
        <ol-style-fill color="rgba(255, 255, 255, 0.2)" />
        <ol-style-circle :radius="7">
          <ol-style-fill color="#ffcc33" />
        </ol-style-circle>
      </ol-style>
    </ol-vector-layer>

    <ol-geolocation :projection="projection" @change:position="geoLocChange">
      <template>
        <ol-vector-layer :zIndex="2">
          <ol-source-vector>
            <ol-feature ref="positionFeature">
              <ol-geom-point :coordinates="position"></ol-geom-point>
              <!-- <ol-style>
                <ol-style-icon :src="" :scale="0.1"></ol-style-icon>
              </ol-style> -->
            </ol-feature>
          </ol-source-vector>
        </ol-vector-layer>
      </template>
    </ol-geolocation>
    <ol-fullscreen-control />
    <ol-scaleline-control :bar="showAsBar" />
  </ol-map>
</template>

<script setup lang="ts">
import { Feature, Map, View, type MapBrowserEvent } from 'ol'
import { LineString } from 'ol/geom'
import { type DrawEvent } from 'ol/interaction/Draw'
import { onMounted, ref } from 'vue'
import { getLength } from 'ol/sphere'
import type { EventsKey } from 'ol/events'
import type { Coordinate } from 'ol/coordinate'
import { unByKey } from 'ol/Observable'
import type { ObjectEvent } from 'ol/Object'

const mapRef = ref<{ map: Map } | null>(null)
const drawType = ref('LineString')
const sketch = ref<Feature | null>(null)

const tooltipCoord = ref<Coordinate | null>(null)
const tooltipText = ref('')
const helpTooltipCoord = ref<Coordinate | null>(null)
const helpTooltipText = ref('')

const center = ref([40, 40])
const projection = ref('EPSG:4326')
const zoom = ref(12)
const view = ref<View>()
const position = ref([])
const showAsBar = ref(false)

let listener: EventsKey
const continueLineMsg = 'Click to continue drawing the line'

function drawstart(evt: DrawEvent) {
  sketch.value = evt.feature
  const geom = sketch.value.getGeometry()
  if (geom instanceof LineString) {
    tooltipCoord.value = geom.getLastCoordinate()

    listener = geom.on('change', function (evt) {
      const geom = evt.target
      if (geom instanceof LineString) {
        tooltipText.value = formatLength(geom)
        tooltipCoord.value = geom.getLastCoordinate()
      }
    })
  }
}

function drawend() {
  // remove drawn sketch
  sketch.value = null
  // unset tooltip so that a new one can be created
  tooltipCoord.value = null
  tooltipText.value = ''
  // cleanup listeners
  unByKey(listener)
}

function showHelpInfoOnPointermove(evt: MapBrowserEvent<PointerEvent>) {
  if (evt.dragging) {
    return
  }
  let helpMsg = 'Click to start drawing'
  const geom = sketch.value?.getGeometry()
  if (geom instanceof LineString) {
    helpMsg = continueLineMsg
  }

  helpTooltipText.value = helpMsg
  helpTooltipCoord.value = evt.coordinate
}

function formatLength(line: LineString) {
  const length = getLength(line)
  let output = ''
  if (length > 100) {
    output = Math.round((length / 1000) * 100) / 100 + ' ' + 'km'
  } else {
    output = Math.round(length * 100) / 100 + ' ' + 'm'
  }
  return output
}

const geoLocChange = (event: ObjectEvent) => {
  console.log('AAAAA', event)
  position.value = event.target.getPosition()
  view.value?.setCenter(event.target?.getPosition())
}

onMounted(() => {
  // @ts-expect-error It works bro
  mapRef.value?.map.on('pointermove', showHelpInfoOnPointermove)
  mapRef.value?.map.getViewport().addEventListener('mouseout', function () {
    helpTooltipCoord.value = null
    helpTooltipText.value = ''
  })
})
</script>

<style scoped>
.tooltip {
  position: relative;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 4px;
  color: white;
  padding: 4px 8px;
  opacity: 0.7;
  white-space: nowrap;
  font-size: 12px;
  cursor: default;
  user-select: none;
}
.tooltip-measure {
  font-weight: bold;
}
.tooltip-info {
  background-color: #ffcc33;
  color: black;
  border: 1px solid white;
}
.tooltip-measure:before {
  border-top: 6px solid rgba(0, 0, 0, 0.5);
  border-right: 6px solid transparent;
  border-left: 6px solid transparent;
  content: '';
  position: absolute;
  bottom: -6px;
  margin-left: -7px;
  left: 50%;
}
</style>
