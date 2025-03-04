const VITE_EHR_AGENT_URL = import.meta.env.VITE_EHR_AGENT_URL;

function EhrOperator() {
  return (
    <iframe
      src={`${VITE_EHR_AGENT_URL}?autoconnect=true&resize=remote`}
      title="VNC Viewer"
      width="100%"
      height="1080px"
      style={{ border: "none" }}
    />
  );
}

export default EhrOperator;
