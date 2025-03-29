import { injectJsError } from "./libs/jsError";
import { injectXHR } from "./libs/xhr";
import { blankScreen } from "./libs/blankScreen";
import { timing } from "./libs/timing";

injectJsError();
injectXHR();
blankScreen();
timing();
