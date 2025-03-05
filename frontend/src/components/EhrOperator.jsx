const VITE_EHR_AGENT_URL = import.meta.env.VITE_EHR_AGENT_URL;

function EhrOperator() {
  return (
    <iframe
      src={`${VITE_EHR_AGENT_URL}?autoconnect=true&resize=remote`}
      width="100%"
      height="700px"
      style={{ border: "none" }}
    />
  );
}

export default EhrOperator;
