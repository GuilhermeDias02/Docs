import { useContext, useEffect } from "react";
import { WebSocketContext } from "./context/wsprovider";

export function Document() {
    const { selectDoc } = useContext(WebSocketContext);

    useEffect(() => {
        selectDoc(123);
    }, []);
    return(
        <h1>hey</h1>
    )
}