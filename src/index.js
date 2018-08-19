
import React, { Component } from "react";
import { render } from "react-dom";
import NodeGroup from "react-move/NodeGroup";
import { range } from "d3-array";
import { easeExpOut } from "d3-ease";
import "./index.css";

function updateOrder(arr, beg, end) {
  const copy = arr.slice(0);
  const val = copy[beg];
  copy.splice(beg, 1);
  copy.splice(end, 0, val);
  return copy;
}

function clamp(n, min, max) {
  return Math.max(Math.min(n, max), min);
}

const itemsCount = 8;
const itemHeight = 80; // set list-item height and line-height in css as well

class Index extends Component {
  state = {
    topDeltaY: 0,
    mouseY: 0,
    isPressed: false,
    lastPressed: 0,
    order: range(itemsCount),
    itemName: 'Drag and drop item'
  };

  handleTouchStart = (pos, pressY, { touches: [{ pageY }] }) => {
    this.setState({
      topDeltaY: pageY - pressY,
      mouseY: pressY,
      isPressed: true,
      lastPressed: pos
    });

    window.addEventListener("touchmove", this.handleTouchMove);
    window.addEventListener("touchend", this.handleTouchEnd);
  };

  handleTouchMove = e => {
    e.preventDefault();
    this.handleMouseMove(e.touches[0]);
  };

  handleMouseDown = (pos, pressY, { pageY }) => {
    this.setState({
      topDeltaY: pageY - pressY,
      mouseY: pressY,
      isPressed: true,
      lastPressed: pos
    });

    window.addEventListener("mousemove", this.handleMouseMove);
    window.addEventListener("mouseup", this.handleMouseUp);
  };

  handleMouseMove = ({ pageY }) => {
    const { isPressed, topDeltaY, order, lastPressed } = this.state;

    if (isPressed) {
      const mouseY = pageY - topDeltaY;
      const currentRow = clamp(
        Math.round(mouseY / itemHeight),
        0,
        itemsCount - 1
      );
      let newOrder = order;

      if (currentRow !== order.indexOf(lastPressed)) {
        newOrder = updateOrder(order, order.indexOf(lastPressed), currentRow);
      }

      this.setState({ mouseY, order: newOrder });
    }
  };

  handleMouseUp = () => {
    this.setState({ isPressed: false, topDeltaY: 0 });

    window.removeEventListener("mouseup", this.handleMouseUp);
    window.removeEventListener("mousemove", this.handleMouseMove);
  };

  handleTouchEnd = () => {
    this.setState({ isPressed: false, topDeltaY: 0 });

    window.removeEventListener("touchmove", this.handleTouchMove);
    window.removeEventListener("touchend", this.handleTouchEnd);
  };

  render() {
    const { mouseY, isPressed, lastPressed, order, itemName } = this.state;

    return (
      <div className="body">
            <h1>Dragable List Item's</h1>
      <div className="container">
     
        <NodeGroup
          data={range(itemsCount)}
          keyAccessor={d => `item-key-${d}`}
          start={d => ({
            scale: 1,
            shadow: 1,
            y: order.indexOf(d) * itemHeight
          })}
          update={d => {
            const dragging = lastPressed === d && isPressed;

            return {
              scale: [dragging ? 1.1 : 1],
              shadow: [dragging ? 5 : 1],
              y: [order.indexOf(d) * itemHeight],
              timing: { duration: 350, ease: easeExpOut }
            };
          }}
        >
          {nodes => (
            <div className="list">
              {nodes.map(({ key, data, state }) => {
                const { shadow, scale, y } = state;
                const transY = lastPressed === data && isPressed ? mouseY : y;

                return (
                  <div
                    className="list-item"
                    key={key}
                    onMouseDown={e => this.handleMouseDown(data, y, e)}
                    onTouchStart={e => this.handleTouchStart(data, y, e)}
                    style={{
                      boxShadow: `rgba(0, 0, 0, 0.1) 0px ${shadow}px ${4 *
                        shadow}px 0px`,
                        
                      transform: `translate3d(0, ${transY}px, 0) scale(${scale})`,
                      WebkitTransform: `translate3d(0, ${transY}px, 0) scale(${scale})`,
                      zIndex: data === lastPressed ? 99 : data
                    }}
                  >
                    <div  className="list-item-number">
                            {order.indexOf(data) + 1}  {itemName}  
                    </div>  
                
                  </div>
                );
              })}
            </div>
          )}
        </NodeGroup>
      </div>
      </div>
    );
  }
}

render(<Index />, document.getElementById("root"));
