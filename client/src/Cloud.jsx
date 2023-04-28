import React, { useRef, useEffect } from "react";
import * as d3 from "d3";
import cloud from "d3-cloud";

const Cloud = ({ words, headHeight = 0 }) => {
  if (!Array.isArray(words) || words.length === 0) words = [];
  const svgRef = useRef(null);
  const fonts = () => {
    const fontArr = [
      "Rancho",
      "Lakki Reddy",
      "Righteous",
      "Space Mono",
      "Rancho",
      "Lakki Reddy",
      "Righteous",
      "Space Mono",
    ];
    const fontInd = Math.floor(Math.random() * 7);
    return fontArr[fontInd];
  };
  useEffect(() => {
    const handleResize = () => {
      //use ratio between width and height as a modifier to better control font size when window changes
      const screenW = window.innerWidth;
      const screenH = window.innerHeight;
      const spaceRatio = (screenW * screenH) / 900000;
      const draw = (words) => {
        const layout = cloud()
          //canvas size
          //getting the height of the title and input box div element from board component sent via props to hear so I can calculate and set the size of the words canvas.
          .size([window.innerWidth, window.innerHeight - headHeight])
          .words(words)
          .padding(5)
          //rotate with 50% chance is 3 degrees in both directions
          .rotate(() => (Math.random() < 0.5 ? -1 : 1) * 3)
          //using algorithmic scale function to set the size ratio variation between words according to count number. The first number increases will make the word increase significantly while the more the count property grows the slow the increase to avoid words growing too big and getting off the screen.
          //Math.max ensures the font size is never lower than 8
          //And when screen H is larger than screen W (mobiles) we increase the scaling multiplier to 25 to make words a bit larger on mobile screens
          .fontSize((d) =>
            Math.max(
              Math.log(d.count + 1) *
                `${screenW > screenH ? 18 : 25}` *
                spaceRatio,
              8
            )
          )

          //font size changes with screen but still words are a bit small on mobile and when there are many words, the larger ones still dissappear from screen

          .on("end", (words) => {
            //clear the canvas before each words render to avoid double rendering
            const svg = d3.select(svgRef.current);
            svg.selectAll("*").remove();

            svg
              .attr("width", layout.size()[0])
              .attr("height", layout.size()[1])
              .append("g")
              .attr(
                "transform",
                //controls position in the canvas: denominator 2 means centered
                `translate(${layout.size()[0] / 2},${layout.size()[1] / 2})`
              )
              .selectAll("text")
              .data(words)
              .join("text")
              //apply reandom fonts
              .attr("font-family", () => fonts())
              .style("font-size", (d) => `${d.size}px`)
              .style("fill", (d) => d.color)
              .attr("text-anchor", "middle")
              .attr(
                "transform",
                (d) => `translate(${d.x},${d.y})rotate(${d.rotate})`
              )
              .text((d) => d.text);
          });
        layout.start();
      };
      // Convert each word object to an object with 'text', 'size', and 'color' properties
      draw(
        words.map((word) => ({
          text: word.text,
          size: 0,
          //random hsl colors to each word
          color: `hsl(${Math.floor(Math.random() * 359)}, 100%, 60%)`,
          count: word.count,
          font: fonts(),
        }))
      );
    };
    //attach listener to window
    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      //on component unmount remove listener
      window.removeEventListener("resize", handleResize);
    };
  }, [words, headHeight]);

  return <svg className="non-select" ref={svgRef} />;
};

export default Cloud;
