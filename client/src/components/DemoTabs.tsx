export function DemoTabs() {
  return (
    <div className="demo-top-bar">
      <div className="demo-tabs-container">
        <button
          className="demo-tab"
          onClick={() =>
            (window.location.href = "http://demo.staging-bolt.com/")
          }>
          Standard Demo
        </button>
        <button className="demo-tab demo-tab-active">Gaming Demo</button>
      </div>
    </div>
  );
}
