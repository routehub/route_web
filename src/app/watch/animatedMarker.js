L.AnimatedMarker = L.Marker.extend({
  options: {
    // meters
    distance: 100,
    // ms
    interval: 500,
    // animate on add?
    autoStart: false,
    // callback onend
    onEnd() { },
    clickable: false,
  },

  initialize(latlngs, options) {
    this.setLine(latlngs);
    L.Marker.prototype.initialize.call(this, latlngs[0], options);
  },

  // Breaks the line up into tiny chunks (see options) ONLY if CSS3 animations
  // are not supported.
  _chunk(latlngs) {
    let i;
    const len = latlngs.length;
    const chunkedLatLngs = [];

    for (i = 1; i < len; i++) {
      let cur = L.latLng(latlngs[i - 1]);
      const next = L.latLng(latlngs[i]);
      let dist = cur.distanceTo(next);
      const factor = this.options.distance / dist;
      const dLat = factor * (next.lat - cur.lat);
      const dLng = factor * (next.lng - cur.lng);

      if (dist > this.options.distance) {
        while (dist > this.options.distance) {
          cur = new L.LatLng(cur.lat + dLat, cur.lng + dLng);
          dist = cur.distanceTo(next);
          chunkedLatLngs.push(cur);
        }
      } else {
        chunkedLatLngs.push(cur);
      }
    }
    chunkedLatLngs.push(latlngs[len - 1]);

    return chunkedLatLngs;
  },

  onAdd(map) {
    L.Marker.prototype.onAdd.call(this, map);
    this.map = map;
    // Start animating when added to the map
    if (this.options.autoStart) {
      this.start();
    }
  },

  animate() {
    const self = this;
    const len = this._latlngs.length;
    let speed = this.options.interval;

    // Normalize the transition speed from vertex to vertex
    if (this._i < len && this.i > 0) {
      speed = this._latlngs[this._i - 1].distanceTo(this._latlngs[this._i]) / this.options.distance * this.options.interval;
    }


    // Only if CSS3 transitions are supported
    if (L.DomUtil.TRANSITION) {
      if (this._icon) { this._icon.style[L.DomUtil.TRANSITION] = (`all ${speed}ms linear`); }
      if (this._shadow) { this._shadow.style[L.DomUtil.TRANSITION] = `all ${speed}ms linear`; }
    }

    // Move to the next vertex
    this.setLatLng(this._latlngs[this._i]);
    this.map.panTo(this._latlngs[this._i]);
    this._i++;

    // Queue up the animation to the next next vertex
    this._tid = setTimeout(function () {
      if (self._i === len) {
        self.options.onEnd.apply(self, Array.prototype.slice.call(arguments));
      } else {
        self.animate();
      }
    }, speed);
  },

  // Start the animation
  start() {
    this.animate();
  },

  // Stop the animation in place
  stop() {
    if (this._tid) {
      clearTimeout(this._tid);
    }
  },

  setInterval(interval) {
    this.options.interval = interval || 500;
  },

  setLine(latlngs) {
    this._latlngs = this._chunk(latlngs);
    //        this.options.distance = 10;
    //        this.options.interval = 30;
    this._i = 0;
  },

});

L.animatedMarker = function (latlngs, options) {
  return new L.AnimatedMarker(latlngs, options);
};
