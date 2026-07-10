import { createContext } from "react";

const AppContext = createContext({
    current_state:{},
    should_hide_right_sidebar:false,
    update_context:()=>{},

});

export default AppContext;