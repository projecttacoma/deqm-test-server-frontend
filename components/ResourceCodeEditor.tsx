import React from "react";
import CodeMirror from "@uiw/react-codemirror";
import { json, jsonParseLinter } from "@codemirror/lang-json";
import { linter } from "@codemirror/lint";

const jsonLinter = jsonParseLinter();

/**
 * interface for the props that a ResourceCodeEditor component takes in.
 * @initialValue is what the code editor will contain initially
 * @onUpdate is a state variable function that is used to pass the code editor's current contents to a parent component
 * @onValidate is a state variable function that is used to pass the lint error status of the code editor to a parent component
 */
export interface ResourceCodeEditorProps {
  initialValue: string;
  onUpdate?: (submittedVal: string) => void;
  onValidate?: (hasLintError: boolean, diagnosticMessages: string[]) => void;
}

/**
 * ResourceCodeEditor is a component for rendering a JSON Code Editor with lint error diagnostics.
 * @param props see interface ResourceCodeEditorProps
 * @returns React node composed of a CodeMirror component
 */
const ResourceCodeEditor = (props: ResourceCodeEditorProps) => {
  return (
    <CodeMirror
      data-testid="resource-code-editor"
      value={props.initialValue}
      height="100vh"
      extensions={[json(), linter(jsonLinter)]}
      onUpdate={(v) => {
        if (props.onValidate) {
          const diagnosticMessages = jsonLinter(v.view).map((d) => d.message);

          if (diagnosticMessages.length === 0) {
            props.onValidate(false, diagnosticMessages);
          } else {
            props.onValidate(true, diagnosticMessages);
          }
        }
        if (props.onUpdate) {
          props.onUpdate(v.state.toJSON().doc);
        }
      }}
    />
  );
};
export default ResourceCodeEditor;
