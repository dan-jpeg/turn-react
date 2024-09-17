import Paper from "paper";

const draw1 = () => {
    let myPath;

    Paper.view.onMouseDown = (event) => {
        myPath = new Paper.Path();
        myPath.strokeColor = "black";
        myPath.strokeWidth = 3;
        myPath.add(event.point);
    };

    Paper.view.onMouseDrag = (event) => {
        myPath.add(event.point);
    };
};

export default draw1;