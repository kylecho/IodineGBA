"use strict";
/*
 * This file is part of IodineGBA
 *
 * Copyright (C) 2012-2015 Grant Galitz
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * version 2 as published by the Free Software Foundation.
 * The full license is available at http://www.gnu.org/licenses/gpl.html
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 */
function GameBoyAdvanceAffineBGRenderer(gfx, BGLayer) {
    this.gfx = gfx;
    this.BGLayer = BGLayer;
    this.initialize();
}
GameBoyAdvanceAffineBGRenderer.prototype.initialize = function () {
    this.scratchBuffer = getInt32Array(240);
    this.BGdx = 0x100;
    this.BGdmx = 0;
    this.BGdy = 0;
    this.BGdmy = 0x100;
    this.BGReferenceX = 0;
    this.BGReferenceY = 0;
    this.pb = 0;
    this.pd = 0;
    this.priorityPreprocess();
    this.offsetReferenceCounters();
}
if (typeof Math.imul == "function") {
    //Math.imul found, insert the optimized path in:
    GameBoyAdvanceAffineBGRenderer.prototype.renderScanLine = function (line, BGObject) {
        line = line | 0;
        var x = this.pb | 0;
        var y = this.pd | 0;
        if (this.gfx.BGMosaic[this.BGLayer & 3]) {
            //Correct line number for mosaic:
            var mosaicY = this.gfx.mosaicRenderer.getMosaicYOffset(line | 0) | 0;
            x = ((x | 0) - Math.imul(this.BGdmx | 0, mosaicY | 0)) | 0;
            y = ((y | 0) - Math.imul(this.BGdmy | 0, mosaicY | 0)) | 0;
        }
        for (var position = 0; (position | 0) < 240; position = ((position | 0) + 1) | 0, x = ((x | 0) + (this.BGdx | 0)) | 0, y = ((y | 0) + (this.BGdy | 0)) | 0) {
            //Fetch pixel:
            this.scratchBuffer[position | 0] = this.priorityFlag | BGObject.fetchPixel(x >> 8, y >> 8);
        }
        if (this.gfx.BGMosaic[this.BGLayer & 3]) {
            //Pixelize the line horizontally:
            this.gfx.mosaicRenderer.renderMosaicHorizontal(this.scratchBuffer);
        }
        return this.scratchBuffer;
    }
    GameBoyAdvanceAffineBGRenderer.prototype.offsetReferenceCounters = function () {
        var end = this.gfx.lastUnrenderedLine | 0;
        this.pb = Math.imul(((this.pb | 0) + (this.BGdmx | 0)) | 0, end | 0) | 0;
        this.pd = Math.imul(((this.pd | 0) + (this.BGdmy | 0)) | 0, end | 0) | 0;
    }
}
else {
    //Math.imul not found, use the compatibility method:
    GameBoyAdvanceAffineBGRenderer.prototype.renderScanLine = function (line, BGObject) {
        var x = this.pb;
        var y = this.pd;
        if (this.gfx.BGMosaic[this.BGLayer & 3]) {
            //Correct line number for mosaic:
            var mosaicY = this.gfx.mosaicRenderer.getMosaicYOffset(line | 0);
            x -= this.BGdmx * mosaicY;
            y -= this.BGdmy * mosaicY;
        }
        for (var position = 0; position < 240; ++position, x += this.BGdx, y += this.BGdy) {
            //Fetch pixel:
            this.scratchBuffer[position] = this.priorityFlag | BGObject.fetchPixel(x >> 8, y >> 8);
        }
        if (this.gfx.BGMosaic[this.BGLayer & 3]) {
            //Pixelize the line horizontally:
            this.gfx.mosaicRenderer.renderMosaicHorizontal(this.scratchBuffer);
        }
        return this.scratchBuffer;
    }
    GameBoyAdvanceAffineBGRenderer.prototype.offsetReferenceCounters = function () {
        var end = this.gfx.lastUnrenderedLine | 0;
        this.pb = (((this.pb | 0) + (this.BGdmx | 0)) * (end | 0)) | 0;
        this.pd = (((this.pd | 0) + (this.BGdmy | 0)) * (end | 0)) | 0;
    }
}
GameBoyAdvanceAffineBGRenderer.prototype.incrementReferenceCounters = function () {
    this.pb = ((this.pb | 0) + (this.BGdmx | 0)) | 0;
    this.pd = ((this.pd | 0) + (this.BGdmy | 0)) | 0;
}
GameBoyAdvanceAffineBGRenderer.prototype.resetReferenceCounters = function () {
    this.pb = this.BGReferenceX | 0;
    this.pd = this.BGReferenceY | 0;
}
GameBoyAdvanceAffineBGRenderer.prototype.priorityPreprocess = function () {
    this.priorityFlag = (this.gfx.BGPriority[this.BGLayer] << 23) | (1 << (this.BGLayer + 0x10));
}
GameBoyAdvanceAffineBGRenderer.prototype.writeBGPA8_0 = function (data) {
    data = data | 0;
    this.BGdx = (this.BGdx & 0xFFFFFF00) | data;
}
GameBoyAdvanceAffineBGRenderer.prototype.writeBGPA8_1 = function (data) {
    data = data | 0;
    data = (data << 24) >> 16;
    this.BGdx = data | (this.BGdx & 0xFF);
}
GameBoyAdvanceAffineBGRenderer.prototype.writeBGPA16 = function (data) {
    data = data | 0;
    this.BGdx = (data << 16) >> 16;
}
GameBoyAdvanceAffineBGRenderer.prototype.writeBGPB8_0 = function (data) {
    data = data | 0;
    this.BGdmx = (this.BGdmx & 0xFFFFFF00) | data;
}
GameBoyAdvanceAffineBGRenderer.prototype.writeBGPB8_1 = function (data) {
    data = data | 0;
    data = (data << 24) >> 16;
    this.BGdmx = data | (this.BGdmx & 0xFF);
}
GameBoyAdvanceAffineBGRenderer.prototype.writeBGPB16 = function (data) {
    data = data | 0;
    this.BGdmx = (data << 16) >> 16;
}
GameBoyAdvanceAffineBGRenderer.prototype.writeBGPAB32 = function (data) {
    data = data | 0;
    this.BGdx = (data << 16) >> 16;
    this.BGdmx = data >> 16;
}
GameBoyAdvanceAffineBGRenderer.prototype.writeBGPC8_0 = function (data) {
    data = data | 0;
    this.BGdy = (this.BGdy & 0xFFFFFF00) | data;
}
GameBoyAdvanceAffineBGRenderer.prototype.writeBGPC8_1 = function (data) {
    data = data | 0;
    data = (data << 24) >> 16;
    this.BGdy = data | (this.BGdy & 0xFF);
}
GameBoyAdvanceAffineBGRenderer.prototype.writeBGPC16 = function (data) {
    data = data | 0;
    this.BGdy = (data << 16) >> 16;
}
GameBoyAdvanceAffineBGRenderer.prototype.writeBGPD8_0 = function (data) {
    data = data | 0;
    this.BGdmy = (this.BGdmy & 0xFFFFFF00) | data;
}
GameBoyAdvanceAffineBGRenderer.prototype.writeBGPD8_1 = function (data) {
    data = data | 0;
    data = (data << 24) >> 16;
    this.BGdmy = data | (this.BGdmy & 0xFF);
}
GameBoyAdvanceAffineBGRenderer.prototype.writeBGPD16 = function (data) {
    data = data | 0;
    this.BGdmy = (data << 16) >> 16;
}
GameBoyAdvanceAffineBGRenderer.prototype.writeBGPCD32 = function (data) {
    data = data | 0;
    this.BGdy = (data << 16) >> 16;
    this.BGdmy = data >> 16;
}
GameBoyAdvanceAffineBGRenderer.prototype.writeBGX8_0 = function (data) {
    data = data | 0;
    this.BGReferenceX = (this.BGReferenceX & 0xFFFFFF00) | data;
    //Writing to the x reference doesn't reset the counters during draw!
}
GameBoyAdvanceAffineBGRenderer.prototype.writeBGX8_1 = function (data) {
    data = data | 0;
    this.BGReferenceX = (data << 8) | (this.BGReferenceX & 0xFFFF00FF);
    //Writing to the x reference doesn't reset the counters during draw!
}
GameBoyAdvanceAffineBGRenderer.prototype.writeBGX8_2 = function (data) {
    data = data | 0;
    this.BGReferenceX = (data << 16) | (this.BGReferenceX & 0xFF00FFFF);
    //Writing to the x reference doesn't reset the counters during draw!
}
GameBoyAdvanceAffineBGRenderer.prototype.writeBGX8_3 = function (data) {
    data = data | 0;
    data = (data << 28) >> 4;
    this.BGReferenceX = data | (this.BGReferenceX & 0xFFFFFF);
    //Writing to the x reference doesn't reset the counters during draw!
}
GameBoyAdvanceAffineBGRenderer.prototype.writeBGX16_0 = function (data) {
    data = data | 0;
    this.BGReferenceX = (this.BGReferenceX & 0xFFFF0000) | data;
    //Writing to the x reference doesn't reset the counters during draw!
}
GameBoyAdvanceAffineBGRenderer.prototype.writeBGX16_1 = function (data) {
    data = data | 0;
    data = (data << 20) >> 4;
    this.BGReferenceX = (this.BGReferenceX & 0xFFFF) | data;
    //Writing to the x reference doesn't reset the counters during draw!
}
GameBoyAdvanceAffineBGRenderer.prototype.writeBGX32 = function (data) {
    data = data | 0;
    this.BGReferenceX = (data << 4) >> 4;
    //Writing to the x reference doesn't reset the counters during draw!
}
GameBoyAdvanceAffineBGRenderer.prototype.writeBGY8_0 = function (data) {
    data = data | 0;
    this.BGReferenceY = (this.BGReferenceY & 0xFFFFFF00) | data;
    this.resetReferenceCounters();
}
GameBoyAdvanceAffineBGRenderer.prototype.writeBGY8_1 = function (data) {
    data = data | 0;
    this.BGReferenceY = (data << 8) | (this.BGReferenceY & 0xFFFF00FF);
    this.resetReferenceCounters();
}
GameBoyAdvanceAffineBGRenderer.prototype.writeBGY8_2 = function (data) {
    data = data | 0;
    this.BGReferenceY = (data << 16) | (this.BGReferenceY & 0xFF00FFFF);
    this.resetReferenceCounters();
}
GameBoyAdvanceAffineBGRenderer.prototype.writeBGY8_3 = function (data) {
    data = data | 0;
    data = (data << 28) >> 4;
    this.BGReferenceY = data | (this.BGReferenceY & 0xFFFFFF);
    this.resetReferenceCounters();
}
GameBoyAdvanceAffineBGRenderer.prototype.writeBGY16_0 = function (data) {
    data = data | 0;
    this.BGReferenceY = (this.BGReferenceY & 0xFFFF0000) | data;
    this.resetReferenceCounters();
}
GameBoyAdvanceAffineBGRenderer.prototype.writeBGY16_1 = function (data) {
    data = data | 0;
    data = (data << 20) >> 4;
    this.BGReferenceY = (this.BGReferenceY & 0xFFFF) | data;
    this.resetReferenceCounters();
}
GameBoyAdvanceAffineBGRenderer.prototype.writeBGY32 = function (data) {
    data = data | 0;
    this.BGReferenceY = (data << 4) >> 4;
    this.resetReferenceCounters();
}