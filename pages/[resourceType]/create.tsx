import { TextInput, Button, Group, Box } from "@mantine/core";
import React, { useRef } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { useEffect, useState } from "react";

const NewResource = () => {
  const [resource, setResource] = useState({});

  const onChange = React.useCallback((value) => {
    setResource(value);
  }, []);
  return (
    <div style={{ padding: "10px" }}>
      <h2 style={{ textAlign: "center", color: "#4a4f4f" }}> Create New Resource </h2>
      <CodeMirror
        data-testID="codeBlock"
        value="console.log('hello world!');"
        height="500px"
        extensions={[javascript({ jsx: true })]}
        onChange={onChange}
      />
      <br /> <br />
      <div style={{ textAlign: "center" }}>
        <Button onClick={() => console.log(resource)} color="cyan" variant="filled" size="lg">
          Submit Resource
        </Button>
      </div>
    </div>
  );
};

export default NewResource;
