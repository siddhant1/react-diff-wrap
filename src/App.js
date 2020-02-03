import React from "react";
import HrDiffWrap from "./DiffWrap";

function App() {
  const [state, setState] = React.useState("split");
  const [comments, setComments] = React.useState({});
  const [patch, setPatch] = React.useState(`
diff --git a/package.json b/package.json
index 686b4f36..5b1168b6 100644
--- a/package.json
+++ b/package.json
@@ -25,2 +25,3 @@
   "dependencies": {
+    "@types/d3": "^5.7.2",
     "@types/react": "^16.9.17",
@@ -29,2 +30,4 @@
     "ajv": "^6.10.2",
+    "d3-array": "^2.3.3",
+    "d3-scale": "^3.2.0",
     "d3-geo-projection": "^2.8.1",
diff --git a/src/actions/editor.ts b/src/actions/editor.ts
index c3fe5f78..c50020f2 100644
--- a/src/actions/editor.ts
+++ b/src/actions/editor.ts
@@ -41,2 +41,4 @@ export const MERGE_CONFIG_SPEC: 'MERGE_CONFIG_SPEC' = 'MERGE_CONFIG_SPEC';
 export const EXTRACT_CONFIG_SPEC: 'EXTRACT_CONFIG_SPEC' = 'EXTRACT_CONFIG_SPEC';
+export const SET_SIGNALS: 'SET_SIGNALS' = 'SET_SIGNALS';
+export const ADD_SIGNAL: 'ADD_SIGNAL' = 'ADD_SIGNAL';
 export const SET_DECORATION: 'SET_DECORATION' = 'SET_DECORATION';
@@ -84,2 +86,4 @@ export type Action =
   | ExtractConfigSpec
+  | SetSignals
+  | AddSignal
   | SetDecorations
@@ -389,2 +393,18 @@ export type ExtractConfigSpec = ReturnType<typeof extractConfigSpec>;
 
+export function setSignals(value: any) {
+  return {
+    signals: value,
+    type: SET_SIGNALS
+  };
+}
+export type SetSignals = ReturnType<typeof setSignals>;
+
+export function addSignal(value: any) {
+  return {
+    signal: value,
+    type: ADD_SIGNAL
+  };
+}
+export type AddSignal = ReturnType<typeof addSignal>;
+
 export function setDecorations(value) {
diff --git a/src/components/renderer/index.css b/src/components/renderer/index.css
index 4f477abd..654135e1 100644
--- a/src/components/renderer/index.css
+++ b/src/components/renderer/index.css
@@ -3,2 +3,3 @@
   padding: 10px;
+  position: relative;
   display: inline-block;
@@ -89 +90,14 @@
 }
+
+.chart .chart-overlay {
+  position: absolute;
+  display: none;
+  top: 0;
+  left: 0;
+  right: 0;
+  bottom: 0;
+  background-color: rgba(238, 238, 239, 0.3);
+  z-index: 14;
+  border: 1px solid rgb(79, 153, 252);
+  color: white;
+}
diff --git a/src/components/renderer/renderer.tsx b/src/components/renderer/renderer.tsx
index 817e5058..5405f100 100644
--- a/src/components/renderer/renderer.tsx
+++ b/src/components/renderer/renderer.tsx
@@ -2,3 +2,3 @@ import {UnregisterCallback} from 'history';
 import * as React from 'react';
-import {Maximize} from 'react-feather';
+import {Edit3, Maximize} from 'react-feather';
 import {Portal} from 'react-portal';
@@ -289,2 +289,7 @@ class Editor extends React.PureComponent<Props, State> {
         <div className="chart" style={{backgroundColor: this.props.backgroundColor}}>
+          <div
+            data-tip={"Click on "Continue Recording" to make the chart interactive"}
+            data-place="right"
+            className="chart-overlay"
+          ></div>
           <div ref="chart" style={chartStyle} />
diff --git a/src/components/signal-viewer/index.css b/src/components/signal-viewer/index.css
index e53cf2cb..ab870ef2 100644
--- a/src/components/signal-viewer/index.css
+++ b/src/components/signal-viewer/index.css
@@ -8,2 +8,6 @@
 
+.svg-rect:hover {
+  fill: #fce57e !important;
+}
+
 .editor-table .pointer {
@@ -11,2 +15,3 @@
 }
+
 .editor-table tbody tr td svg {
@@ -18 +23,13 @@
 }
+.timeline-control-buttons {
+  margin: 10px;
+  display: flex;
+  flex-direction: row;
+}
+.timeline-control-buttons button {
+  margin-right: 1em;
+}
+
+.timeline-control-buttons button:focus {
+  outline: none;
+}
diff --git a/src/components/signal-viewer/index.tsx b/src/components/signal-viewer/index.tsx
index cd1b4420..7e02be85 100644
--- a/src/components/signal-viewer/index.tsx
+++ b/src/components/signal-viewer/index.tsx
@@ -1,3 +1,4 @@
 import {connect} from 'react-redux';
-
+import {bindActionCreators, Dispatch} from 'redux';
+import * as EditorActions from '../../actions/editor';
 import {State} from '../../constants/default-state';
@@ -7,2 +8,3 @@ export function mapStateToProps(state: State) {
   return {
+    signals: state.signals,
     view: state.view
@@ -11,2 +13,16 @@ export function mapStateToProps(state: State) {
 
-export default connect(mapStateToProps)(Renderer);
+export function mapDispatchToProps(dispatch: Dispatch<EditorActions.Action>) {
+  return bindActionCreators(
+    {
+      addSignal: EditorActions.addSignal,
+      setSignals: EditorActions.setSignals,
+      setView: EditorActions.setView
+    },
+    dispatch
+  );
+}
+
+export default connect(
+  mapStateToProps,
+  mapDispatchToProps
+)(Renderer);
diff --git a/src/components/signal-viewer/renderer.tsx b/src/components/signal-viewer/renderer.tsx
index 4d9bda50..f291cff9 100644
--- a/src/components/signal-viewer/renderer.tsx
+++ b/src/components/signal-viewer/renderer.tsx
@@ -2,7 +2,8 @@ import React from 'react';
 import * as vega from 'vega';
-import {mapStateToProps} from '.';
+import {mapDispatchToProps, mapStateToProps} from '.';
 import './index.css';
 import SignalRow from './signalRow';
+import TimelineRow from './TimelineRow';
 
-type StoreProps = ReturnType<typeof mapStateToProps>;
+type StoreProps = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;
 
@@ -14,11 +15,23 @@ type Props = StoreProps & OwnComponentProps;
 
-export default class SignalViewer extends React.PureComponent<Props> {
+export default class SignalViewer extends React.PureComponent<Props, any> {
   constructor(props) {
     super(props);
+    this.state = {
+      countSignal: {},
+      hoverValue: {},
+      isTimelineSelected: false,
+      isHovered: false,
+      keys: [],
+      maskListner: false,
+      maxLength: 0,
+      signal: {},
+      xCount: 0,
+      timeline: false
+    };
   }
 
-  public getSignals() {
+  public getKeys(ref = this.props) {
     return Object.keys(
-      this.props.view.getState({
-        data: vega.falsy,
+      ref.view.getState({
+        data: vega.truthy,
         signals: vega.truthy,
@@ -29,24 +42,274 @@ export default class SignalViewer extends React.PureComponent<Props> {
 
+  public getSignals(changedSignal = null) {
+    if (!this.state.timeline) {
+      return;
+    }
+    if (changedSignal) {
+      const obj = {
+        value: this.props.view.signal(changedSignal)
+      };
+      const lastObj = this.props.signals[changedSignal];
+      const prevObj = {...lastObj[lastObj && lastObj.length - 1]};
+      delete prevObj.xCount;
+      (obj as any).xCount = this.state.xCount;
+      const newSignals = this.props.signals[changedSignal].concat(obj);
+      this.props.setSignals({
+        ...this.props.signals,
+        [changedSignal]: newSignals
+      });
+      this.setState(current => {
+        return {
+          ...current,
+          xCount: current.xCount + 1
+        };
+      });
+    } else {
+      const obj = {};
+      this.state.keys.map(key => {
+        obj[key]
+          ? obj[key].push({
+              value: this.props.view.signal(key),
+              xCount: this.state.xCount
+            })
+          : (obj[key] = [{value: this.props.view.signal(key), xCount: this.state.xCount}]);
+      });
+      this.props.setSignals(obj);
+      this.setState({
+        xCount: this.state.xCount + 1
+      });
+    }
+  }
+
+  public onClickInit(key, hoverValue) {
+    this.setState({maskListner: true});
+    const overlay: HTMLElement = document.querySelector('.chart-overlay');
+    overlay.style.display = 'block';
+    this.onHoverInit(key, hoverValue, true); // hover calculation with persist
+  }
+
+  public componentWillReceiveProps(nextProps) {
+    if (this.props.view !== nextProps.view) {
+      const keys = this.getKeys(nextProps);
+      this.setState(
+        {
+          keys,
+          signal: {},
+          xCount: 0,
+          timeline: false,
+          isHovered: false,
+          isTimelineSelected: false,
+          hoverValue: {},
+          countSignal: {},
+          maskListner: false
+        },
+        () => {
+          const overlay: HTMLElement = document.querySelector('.chart-overlay');
+          // remove the overlay
+          overlay.style.display = 'none';
+          if (this.state.timeline) {
+            const obj = {};
+            this.state.keys.map(key => {
+              obj[key]
+                ? obj[key].push({
+                    value: this.props.view.signal(key),
+                    xCount: this.state.xCount
+                  })
+                : (obj[key] = [
+                    {
+                      value: this.props.view.signal(key),
+                      xCount: this.state.xCount
+                    }
+                  ]);
+            });
+
+            this.props.setSignals(obj);
+            this.setState({
+              xCount: 1
+            });
+          }
+        }
+      );
+    }
+  }
+
+  public resetTimeline() {
+    // get the chart
+    const overlay: HTMLElement = document.querySelector('.chart-overlay');
+    // remove the overlay
+    overlay.style.display = 'none';
+    // setState to current value
+    const currentValueObj = {};
+    this.state.keys.map(signal => {
+      currentValueObj[signal] = this.props.signals[signal][this.props.signals[signal].length - 1].value;
+    });
+    this.props.view.setState({signals: currentValueObj});
+    // remove isTimelineSelected, isHovered, hoverValue, signal and CountValue
+    this.setState(
+      {
+        isTimelineSelected: false,
+        signal: {},
+        countSignal: {},
+        hoverValue: {},
+        isHovered: false
+      },
+      () => {
+        setImmediate(() =>
+          this.setState({
+            // remove the maskListner
+            maskListner: false
+          })
+        );
+      }
+    );
+  }
+
+  public onHoverInit(signalKey, hoverValue, shouldPersist = false) {
+    const hoverObj = {
+      [signalKey]: hoverValue.value
+    };
+    const countObj = {
+      [signalKey]: hoverValue.xCount
+    };
+
+    for (const key in this.props.signals) {
+      let i = 0;
+      while (this.props.signals[key][i] && this.props.signals[key][i].xCount <= hoverValue.xCount) {
+        i++;
+      }
+      --i;
+      hoverObj[key] = this.props.signals[key][i].value;
+      countObj[key] = this.props.signals[key][i].xCount;
+    }
+    if (!shouldPersist) {
+      this.setState({
+        hoverValue: hoverObj,
+        isHovered: true
+      });
+    } else {
+      this.setState(
+        {
+          countSignal: countObj,
+          hoverValue: {},
+          isTimelineSelected: true,
+          isHovered: false,
+          signal: hoverObj
+        },
+        () => {
+          this.props.view.setState({signals: hoverObj});
+        }
+      );
+    }
+  }
+
+  public componentDidMount() {
+    window.addEventListener('resize', () => {
+      this.forceUpdate();
+    });
+    const keys = this.getKeys();
+    this.setState({
+      keys
+    });
+  }
+  public valueChange = (key: string, value: any) => {
+    if (this.state.timeline && !this.state.maskListner) {
+      this.getSignals(key);
+    }
+  };
+
   public render() {
     return (
-      <div className="signal-viewer">
-        <table className="editor-table">
-          <thead>
-            <tr>
-              <th>Signal</th>
-              <th>Value</th>
-            </tr>
-          </thead>
-          <tbody>
-            {this.getSignals().map(signal => (
-              <SignalRow
-                onClickHandler={header => this.props.onClickHandler(header)}
-                key={signal}
-                signal={signal}
-                view={this.props.view}
-              />
-            ))}
-          </tbody>
-        </table>
-      </div>
+      <>
+        <div className="timeline-control-buttons">
+          <button
+            style={{
+              backgroundColor: this.state.timeline ? 'red' : '',
+              color: this.state.timeline ? 'white' : 'black'
+            }}
+            onClick={() => {
+              this.setState(
+                {
+                  timeline: !this.state.timeline,
+                  xCount: 0
+                },
+                () => {
+                  this.props.setSignals({});
+                  this.getSignals();
+                  if (!this.state.timeline) {
+                    this.resetTimeline();
+                  }
+                }
+              );
+            }}
+          >
+            {this.state.timeline ? 'Stop Recording & Reset' : 'Record signal changes'}
+          </button>
+          {this.state.timeline && !this.state.maskListner && this.state.xCount > 1 && (
+            <button
+              onClick={() => {
+                this.setState(
+                  {
+                    xCount: 0
+                  },
+                  () => {
+                    this.props.setSignals({});
+                    this.getSignals();
+                  }
+                );
+              }}
+            >
+              Clear Timeline
+            </button>
+          )}
+          {this.state.maskListner && this.state.timeline && (
+            <button onClick={() => this.resetTimeline()}>Continue Recording</button>
+          )}
+        </div>
+        <div className="signal-viewer">
+          <table className="editor-table">
+            <thead>
+              <tr>
+                <th>Signal</th>
+                {this.state.timeline && <th>Timeline</th>}
+                <th>Value</th>
+              </tr>
+            </thead>
+            <tbody>
+              {this.state.keys.map(signal => {
+                return (
+                  <SignalRow
+                    isHovered={this.state.isHovered}
+                    isTimelineSelected={this.state.isTimelineSelected}
+                    clickedSignal={this.state.signal[signal]}
+                    hoverValue={this.state.hoverValue[signal]}
+                    maskListner={this.state.maskListner}
+                    onValueChange={(key, value) => this.valueChange(key, value)}
+                    key={signal}
+                    signal={signal}
+                    view={this.props.view}
+                    timeline={this.state.timeline}
+                  >
+                    {this.state.timeline && (
+                      <TimelineRow
+                        onHoverInit={hoverValue => this.onHoverInit(signal, hoverValue)}
+                        onClickInit={hoverValue => this.onClickInit(signal, hoverValue)}
+                        onHoverEnd={() => {
+                          this.setState({
+                            hoverValue: {},
+                            isHovered: false
+                          });
+                        }}
+                        isTimelineSelected={this.state.isTimelineSelected}
+                        clickedValue={this.state.countSignal[signal]}
+                        data={this.props.signals[signal]}
+                        width={window.innerWidth * 0.3}
+                        xCount={this.state.xCount}
+                      />
+                    )}
+                  </SignalRow>
+                );
+              })}
+            </tbody>
+          </table>
+        </div>
+      </>
     );
diff --git a/src/components/signal-viewer/signalRow.tsx b/src/components/signal-viewer/signalRow.tsx
index 5e64b595..becb2bf1 100644
--- a/src/components/signal-viewer/signalRow.tsx
+++ b/src/components/signal-viewer/signalRow.tsx
@@ -1,4 +1,5 @@
+import stringify from 'json-stringify-pretty-compact';
 import React from 'react';
+import {isDate, debounce} from 'vega';
 import {Search} from 'react-feather';
-import {isDate} from 'vega';
 import {View} from '../../constants';
@@ -9,2 +10,9 @@ interface Props {
   signal: string;
+  onValueChange: (key, value) => void;
+  maskListner: boolean;
+  isHovered: boolean;
+  isTimelineSelected: boolean;
+  clickedSignal: any;
+  hoverValue: any;
+  timeline: boolean;
   onClickHandler?: (header: string) => void;
@@ -17,2 +25,3 @@ interface State {
 export default class SignalRow extends React.PureComponent<Props, State> {
+  private listnerAttached = false;
   constructor(props) {
@@ -28,5 +37,8 @@ export default class SignalRow extends React.PureComponent<Props, State> {
       this.props.view.addSignalListener(this.props.signal, this.signalHandler);
-      this.setState({
-        signalValue: this.props.view.signal(this.props.signal)
-      });
+      this.setState(
+        {
+          signalValue: this.props.view.signal(this.props.signal)
+        },
+        () => this.props.onValueChange(this.props.signal, this.props.view.signal(this.props.signal))
+      );
     }
@@ -34,3 +46,6 @@ export default class SignalRow extends React.PureComponent<Props, State> {
   public componentDidMount() {
-    this.props.view.addSignalListener(this.props.signal, this.signalHandler);
+    if (!this.props.maskListner) {
+      this.props.view.addSignalListener(this.props.signal, this.signalHandler);
+      this.listnerAttached = true;
+    }
   }
@@ -38,3 +53,42 @@ export default class SignalRow extends React.PureComponent<Props, State> {
     this.props.view.removeSignalListener(this.props.signal, this.signalHandler);
+    this.listnerAttached = false;
   }
+
+  public componentWillReceiveProps(nextProps) {
+    if (nextProps.maskListner && this.listnerAttached) {
+      this.props.view.removeSignalListener(this.props.signal, this.signalHandler);
+      this.listnerAttached = false;
+    } else if (!this.listnerAttached && !nextProps.maskListner) {
+      this.props.view.addSignalListener(this.props.signal, this.signalHandler);
+      this.listnerAttached = true;
+    }
+  }
+
+  public renderSignal = () => {
+    const {isTimelineSelected, isHovered, clickedSignal, hoverValue} = this.props;
+    if (isTimelineSelected && isHovered) {
+      return hoverValue;
+    }
+    if (isTimelineSelected) {
+      return clickedSignal;
+    } else if (isHovered) {
+      return hoverValue;
+    } else {
+      return null;
+    }
+  };
+
+  public getBackgroundColor = () => {
+    if (this.props.isTimelineSelected && this.props.isHovered) {
+      return '#fce57e';
+    }
+    if (this.props.isTimelineSelected && this.props.clickedSignal !== undefined) {
+      return '#A4F9C8';
+    } else if (this.props.isHovered && this.props.hoverValue !== undefined) {
+      return '#fce57e';
+    } else {
+      return '';
+    }
+  };
+
   public render() {
@@ -42,4 +96,5 @@ export default class SignalRow extends React.PureComponent<Props, State> {
     let formatted = '';
+    const value = this.renderSignal();
     if (!isDate(this.state.signalValue)) {
-      const formatValue = formatValueLong(this.state.signalValue);
+      const formatValue = formatValueLong(value ? value : this.state.signalValue);
       if (formatValue !== undefined) {
@@ -53,3 +108,3 @@ export default class SignalRow extends React.PureComponent<Props, State> {
       tooLong = false;
-      formatted = new Date(this.state.signalValue).toUTCString();
+      formatted = new Date(value ? value : this.state.signalValue).toUTCString();
     }
@@ -65,3 +120,8 @@ export default class SignalRow extends React.PureComponent<Props, State> {
           </td>
-          <td title="The field is too large to be displayed. Please use the view API (see JS console).">
+          {this.props.timeline && <td style={{padding: 0}}>{this.props.children}</td>}
+          <td
+            style={{backgroundColor: this.getBackgroundColor()}}
+            key={this.props.signal}
+            title="The field is too large to be displayed. Please use the view API (see JS console)."
+          >
             <span>(...)</span>
@@ -74,2 +134,3 @@ export default class SignalRow extends React.PureComponent<Props, State> {
           <td
+            style={{whiteSpace: 'nowrap'}}
             className="pointer"
@@ -80,3 +141,12 @@ export default class SignalRow extends React.PureComponent<Props, State> {
           </td>
-          <td key={this.props.signal}>{formatted}</td>
+          {this.props.timeline && <td style={{padding: 0}}>{this.props.children}</td>}
+          <td
+            style={{
+              whiteSpace: 'nowrap',
+              backgroundColor: this.getBackgroundColor()
+            }}
+            key={this.props.signal}
+          >
+            {formatted}
+          </td>
         </tr>
@@ -87,5 +157,10 @@ export default class SignalRow extends React.PureComponent<Props, State> {
   private signalHandler(signalName: string, currentValue) {
-    this.setState({
-      signalValue: currentValue
-    });
+    this.setState(
+      {
+        signalValue: currentValue
+      },
+      () => {
+        this.props.onValueChange(this.props.signal, currentValue);
+      }
+    );
   }
diff --git a/src/constants/default-state.ts b/src/constants/default-state.ts
index 17f17bb4..85590e0f 100644
--- a/src/constants/default-state.ts
+++ b/src/constants/default-state.ts
@@ -40,2 +40,3 @@ export interface State {
   settings: boolean;
+  signals: any;
   tooltipEnable: boolean;
@@ -83,2 +84,3 @@ export const DEFAULT_STATE: State = {
   sidePaneItem: SIDEPANE.Editor,
+  signals: {},
   themeName: 'custom',
diff --git a/src/reducers/index.ts b/src/reducers/index.ts
index 50c6b1f1..715cffe8 100644
--- a/src/reducers/index.ts
+++ b/src/reducers/index.ts
@@ -34,2 +34,3 @@ import {
   SET_SCROLL_POSITION,
+  SET_SIGNALS,
   SET_VEGA_EXAMPLE,
@@ -457,2 +458,8 @@ export default (state: State = DEFAULT_STATE, action: Action): State => {
       return extractConfig(state);
+
+    case SET_SIGNALS:
+      return {
+        ...state,
+        signals: action.signals
+      };
     case SET_DECORATION:
diff --git a/src/store/configure-store.ts b/src/store/configure-store.ts
index 90c9d04b..3441d9cc 100644
--- a/src/store/configure-store.ts
+++ b/src/store/configure-store.ts
@@ -16,3 +16,3 @@ export default function configureStore(initialState: State = DEFAULT_STATE) {
   const paths = Object.keys(DEFAULT_STATE).filter(
-    e => e !== 'editorRef' && e !== 'compiledEditorRef' && e !== 'view' && e !== 'isAuthenticated'
+    e => e !== 'editorRef' && e !== 'compiledEditorRef' && e !== 'signals' && e !== 'view' && e !== 'isAuthenticated'
   );
`);

  const onComment = (success = true, key, comment) => {
    // mocking an API request
    const commentAddPromise = new Promise((resolve, reject) => {
      setTimeout(() => {
        if (success) {
          resolve({ success: true });
        } else {
          reject({ message: "Error" });
        }
      }, 1000);
    });

    // parse the key
    // change the key structure from
    // -> I9+package.json to
    // {
    //  mode:Insert,
    //  lineNumber:9,
    //  fileName:package,json
    // }

    // store it inside the component's state or a global state(optimistically)
    // or store the result when the API suceeds
    commentAddPromise.then(res => {
      const dup = {
        ...comments
      };

      if (!dup[key]) {
        dup[key] = { comments: [] };
      }

      const dupComments = dup[key].comments;

      if (!dupComments) {
        dup[key].comments = [comment];
      } else {
        dupComments.push(comment);
      }
      setComments(dup);
    });

    // return the promise to the component to render the state
    return commentAddPromise;
  };

  const onCommentDelete = (success = true, key) => {
    // do the similar functionalities except adding the comment
    const deletePromise = new Promise((resolve, reject) => {
      setTimeout(() => {
        if (success) {
          resolve({ success: true });
        } else {
          reject({ message: "Error" });
        }
      }, 1000);
    });

    deletePromise.then(res => {
      const dup = {
        ...comments
      };

      delete dup[key];

      setComments(dup);
    });
  };

  return (
    <div className="diff-root-container">
      <button
        onClick={() => {
          if (state === "split") {
            setState("unified");
          } else {
            setState("split");
          }
        }}
      >
        Change view type
      </button>
      <HrDiffWrap
        defaultViewType={"split"}
        patch={patch}
        enableComment={true}
        onComment={onComment}
        onCommentDelete={onCommentDelete}
        comments={comments}
        enableSettings={false}
        type={state}
      />
    </div>
  );
}

export default App;
