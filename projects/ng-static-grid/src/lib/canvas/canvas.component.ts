import { Component, OnInit, ElementRef, ViewChild, AfterContentInit, Input, HostListener } from '@angular/core';
import { NUMBER_PARSER, INT_PARSER } from '../shared/attribute.model';

@Component({
  selector: 'ng-static-grid-canvas',
  styleUrls: ['./canvas.component.css'],
  template: `
  <canvas #canvas class="canvas">
  </canvas>
  `,
})
/* tslint:disable:curly variable-name*/
export class NgStaticGridCanvasComponent implements OnInit, AfterContentInit {

  @ViewChild('canvas', {static: true}) canvas: ElementRef;
  /** The element to cover */
  @Input() coverElement ?: ElementRef;

  private _strokeStyle: string | CanvasGradient | CanvasPattern = '#ae2424'
  /**
   * Set the color of the line.
   * @see https://www.w3schools.com/colors/colors_picker.asp
   */
  @Input() set strokeStyle(val: string | CanvasGradient | CanvasPattern) {
    if (this._strokeStyle !== val) {
      this._strokeStyle = val;
      this.doRedraw();
    }
  }
  get strokeStyle() {return this._strokeStyle; }
  /**
   * Optional color of the shadow.
   * @optional default #343a40
   */
  @Input() shadowColor ? = '#343a40';
  /**
   * Optional global alpha to set.
   */
  @Input() alpha ?: number;

  private _gridSizeX = 24;
  /**
   * Int number how many columns
   * @memberof NgStaticGridCanvasComponent
   */
  @Input() set gridSizeX(val: number) { this._gridSizeX = INT_PARSER(val) || 24; }
  get gridSizeX() {return this._gridSizeX; }
  @Input() set columns(val: number) { this.gridSizeX = val; }
  get columns() { return this.gridSizeX; }

  private _gridSizeY = 24;
  @Input() set gridSizeY(val: number)  { this._gridSizeY = INT_PARSER(val) || 24; }
  get gridSizeY()  { return this._gridSizeY; }
  @Input() set rows(val: number)  { this.gridSizeY = val; }
  get rows()  { return this.gridSizeY; }

  @Input() gridStartX: number;
  @Input() gridEndX: number;

  @Input() gridStartY: number;
  @Input() gridEndY: number;
  /**
   * Takes the min of width or hight and mutiplies it with this number.
   * So that the line scales with the available screen size.
   */
  @Input() strokeGridFactor: number;

  /**
   * Position of the error head
   * @values bottom | top
   * @memberof NgStaticGridCanvasComponent
   */
  @Input() arrowHead = 'bottom';

  private _xFactor: number;
  private _yFactor: number;
  private _contentSet = false;
  constructor(private hostElement: ElementRef) { }

  ngOnInit() {
    this._xFactor = Math.floor(this.gridSizeX / 12);
    this._yFactor = Math.floor(this.gridSizeY / 12);
    if (this.strokeGridFactor == null) {
      this.strokeGridFactor = Math.min(this._xFactor, this._yFactor, 1);
    }
    if (this.gridStartX == null) {
      this.gridStartX = this._xFactor;
    }
    if (this.gridEndX == null) {
      this.gridEndX = this.gridSizeX - this.gridStartX;
    }
    if (this.gridStartY == null) {
      this.gridStartY = this._yFactor;
    }
    if (this.gridEndY == null) {
      this.gridEndY = this.gridSizeY - this.gridStartY;
    }
  }

  ngAfterContentInit(): void {
    // select the parent if possible, if no element to cover was set
    if (!this.coverElement) {
      if (this.hostElement.nativeElement.parentNode) {
        this.coverElement = new ElementRef(this.hostElement.nativeElement.parentNode);
      } else {
        this.coverElement = this.hostElement;
      }
    } // else console.info('coverElement set ...', this.coverElement);
    this._contentSet = true;
    this.doRedraw();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.adjustCanvas(event.target.innerHeight, event.target.innerWidth);
  }

  doRedraw() {
    if (window && this._contentSet) {
      this.adjustCanvas(window.innerHeight, window.innerWidth);
      // console.info('doRedraw ...');
    }
  }
  adjustCanvas(height: number, width: number): void {
    if (this.canvas) {
      const rect: DOMRect = this.coverElement.nativeElement.getBoundingClientRect();
      // console.info('adjustCanvas', rect, width, height, width - rect.left, height - rect.top);
      this.canvas.nativeElement.height = height - rect.top || 0;
      this.canvas.nativeElement.width = width - rect.left || 0;

      this.drawCurvedArrow();
    }
  }

  drawCurvedArrow() {
    if (this.canvas && this.canvas.nativeElement
      && this.canvas.nativeElement.getContext('2d')) {

      const canvas = this.canvas.nativeElement;
      const context: CanvasRenderingContext2D = canvas.getContext('2d');

      // https://www.w3schools.com/graphics/canvas_gradients.asp
      context.strokeStyle = this.strokeStyle;
      context.fillStyle = this.strokeStyle;
      if (this.shadowColor) context.shadowColor = this.shadowColor;
      if (this.alpha) context.globalAlpha = NUMBER_PARSER(this.alpha);

      const oneX = canvas.width / this.gridSizeX; // one step in X
      const oneY = canvas.height / this.gridSizeY; // one step in Y

      context.lineWidth = Math.min(oneX, oneY) * this.strokeGridFactor;
      if (this.shadowColor) context.shadowBlur = context.lineWidth / this.strokeGridFactor;

      const startX = oneX * this.gridStartX;
      const startY = oneY * this.gridStartY;
      const endX = oneX * this.gridEndX;
      const endY = oneY * this.gridEndY;

      // console.info(this.gridStartX, this.gridStartY, this.gridEndX, this.gridEndY);
      // console.info(startX, startY, endX, endY);

      this.draw(context, canvas,
                startX, endX,
                startY, endY,
                oneX, oneY);
    }
  }

  private draw(context: CanvasRenderingContext2D, canvas: any,
               startX: number, endX: number,
               startY: number, endY: number,
               oneX: number, oneY: number) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    const lineX = oneX * this.strokeGridFactor;
    const lineY = oneY * this.strokeGridFactor;

    startX = startX - 1;
    context.lineWidth = 1;

    // ---->
    context.beginPath();

    if (this.arrowHead === 'bottom') {
      context.moveTo(startX , startY);
      context.lineTo(endX - lineX * 3, startY);
    } else {
      context.moveTo(startX + lineX, startY + lineY);
      context.lineTo(startX + lineX, startY + lineY * 1.5 );
      context.lineTo(startX, startY + lineY / 2);
      context.lineTo(startX + lineX, startY - lineY / 2 );
      context.lineTo(startX + lineX, startY);
      context.lineTo(endX - lineX * 3, startY);
    }

    //   --
    //     |
    //   --
    // https://www.w3schools.com/tags/canvas_beziercurveto.asp
    context.bezierCurveTo(
      endX + lineX, startY,
      endX + lineX, endY + lineY,
      endX - lineX * 3, endY + lineY);

    // <---
    context.lineTo(startX + lineX, endY + lineY);

    // arrow head bottom
    if (this.arrowHead === 'bottom') {
      context.lineTo(startX + lineX, endY + lineY * 1.5 );
      context.lineTo(startX, endY + lineY / 2);
      context.lineTo(startX + lineX, endY - lineY / 2 );
      context.lineTo(startX + lineX, endY);
    } else {
      context.lineTo(startX, endY + lineY);
      context.lineTo(startX, endY);
    }


    const xMove = Math.sqrt(lineX);
    // --->
    context.lineTo(endX - lineX * 3 - xMove, endY);
    // --
    //   |
    // --
    context.bezierCurveTo(
      endX + xMove, endY,
      endX + xMove, startY + lineY,
      endX - lineX * 3 - xMove, startY + lineY);

    context.lineTo(startX, startY + lineY);

    context.closePath();
    context.fill();
  }
}
