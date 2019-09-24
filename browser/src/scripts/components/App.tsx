import React from "react";
import classnames from "classnames";

import { getShortMonthName } from "../../../../web/src/helpers/time";

interface Props {}

const App: React.FunctionComponent<Props> = () => {
  return <div>hey, {getShortMonthName(new Date())}</div>;
};

export default App;
