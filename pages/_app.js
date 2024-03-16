import "../src/styles/globals.css";
import "../src/styles/theme.css";

import { ThemeProvider } from "../src/context/ThemeProvider";
import { TestImageWithPosition } from "./TestImage";
import {
  ShowAlertMessages,
  MessageProvider,
} from "../src/context/MessageProvider";

const MyApp = ({ Component, pageProps }) => {
  console.log("redendering MyApp..");
  return (
    <ThemeProvider>
      <div id="app">
        <MessageProvider>
          <div className="m-auto h-full max-w-7xl px-4">
            <Component {...pageProps} />
          </div>
          <ShowAlertMessages
            display="true"
            close="false"
            style={{ position: "fixed", right: 50, bottom: 300 }}
          />
        </MessageProvider>
        <TestImageWithPosition
          className="absolute rounded-md border-double border-primary"
          trace="true"
          close="true"
          style={{
            left: "50px",
            top: "75px",
          }}
          image_width="120px"
        />
      </div>
    </ThemeProvider>
  );
};

export default MyApp;
