import styles from "./lib/styles.jsx";
import parse from "./lib/parse.jsx";
import { run } from "uebersicht";
import Error from "./lib/Error.jsx";
import Clock from "./lib/Clock.jsx";
import Power from "./lib/Power.jsx";
import CPU from "./lib/CPU.jsx";
import WiFi from "./lib/WiFi.jsx";
import Ethernet from "./lib/Ethernet.jsx";
import TimeMachine from "./lib/TimeMachine.jsx";

const style = {
    padding: "0 8px",
    display: "grid",
    gridAutoFlow: "column",
    gridGap: "16px",
    position: "fixed",
    overflow: "hidden",
    padding: "4px 16px",
    height: "20px",
    lineHeight: "20px",
    width: "auto",
    ...(styles.alignBottom ? {bottom: "0px"} : {top: "0px"}),
    right: "0px",
    fontFamily: styles.fontFamily,
    fontSize: styles.fontSize,
    color: styles.colors.minimalFg,
    fontWeight: styles.fontWeight,
    WebkitUserSelect: "none",
    cursor: "default",
    zIndex: 102,
};

const showDesktopHitboxStyle = {
    width: "20px",
    height: "20px",
    position: "fixed",
    bottom: "0px",
    right: "0px",
    zIndex: 110
}
const renderShowDesktopButton = () => {
    return (
        <div style={showDesktopHitboxStyle} onClick={() => {
            run("skhd -k f11")
        }}></div>
    )
}

const refresh = (dispatch) => {
    run("./clarity/scripts/status.sh").then( (output) => {
        dispatch({type: 'DATA_UPDATE', output: output});
    });
}

export const refreshFrequency = 30000;
export const command = (dispatch) => {
    // This synchronises the update interval with the system clock starting from :00 seconds.
    const scheduleUpdate = (action, updateInterval) => {
        let dd = new Date();
        let nextTimeout = updateInterval - ((dd.getSeconds()*1000 + dd.getMilliseconds()) % updateInterval);
        if (isNaN(nextTimeout) || updateInterval == 0) {
            action()
            return
        }
        nextTimeout = Math.min(Math.max(500, nextTimeout), 60000);

        setTimeout(() => {
            action()
        }, nextTimeout);
    }
    refresh(dispatch);
    scheduleUpdate(() => dispatch({type: 'TIME_UPDATE'}), 60000);
}
export const updateState = (event, previousState) => {
  switch(event.type) {
      case 'DATA_UPDATE':
          return {output: event.output};
      case 'TIME_UPDATE':
      default:
          return previousState;
  }
}

export const render = ({ output }) => {
    if (typeof output === "undefined") {
        return (
            <div style={style}>
                <Clock/>
            </div>
        );
    }

    const data = parse(output);
    if (typeof data === "undefined") {
        return (
            <div style={style}>
                <Error msg="Can't parse status output!"/>
                <Clock/>
            </div>
        );
    }
    if (typeof data.error !== "undefined") {
        return (
            <div style={style}>
                <Error msg={data.error}/>
                <Clock/>
            </div>
        );
    }

    /*
    Available status items:

    <WiFi wifiData={data.wifi}/>
    <Ethernet ethernetData={data.ethernet}/>
    <TimeMachine tmData={data.timeMachine}/>
    <CPU cpuData={data.cpu}/>
    <Power powerData={data.power}/>
    <Clock/>
    */
    return (
        <div style={style}>
            <CPU cpuData={data.cpu}/>
            <TimeMachine tmData={data.timeMachine}/>
            <Power powerData={data.power}/>
            <Clock/>
            {renderShowDesktopButton()}
        </div>
    );
};

export default null;
