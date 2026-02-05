// =============================================================================
// JSON-LD SCRIPT COMPONENT
// Injects structured data into page head
// =============================================================================

interface JsonLdProps {
  data: Record<string, any> | Record<string, any>[];
}

export const JsonLd = ({ data }: JsonLdProps) => {
  // Handle both single schema and array of schemas
  const schemas = Array.isArray(data) ? data : [data];

  return (
    <>
      {schemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema, null, 0),
          }}
        />
      ))}
    </>
  );
};
