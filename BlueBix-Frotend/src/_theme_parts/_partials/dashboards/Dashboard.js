import React from "react";
import { MixedWidget1, AdvanceTablesWidget4, ListsWidget8 } from "../widgets";

export function Dashboard() {
  return (
    <>
      <div className="row">
        <div className="col-lg-6">
          <MixedWidget1 className="card-stretch gutter-b" />
        </div>
        <div className="col-lg-6">
          <ListsWidget8 className="card-stretch gutter-b" />
        </div>
      </div>
      <div className="row">
        <div className="col-lg-12">
          <AdvanceTablesWidget4 className="card-stretch gutter-b" />
        </div>
      </div>
    </>
  );
}
