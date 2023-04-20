import { Button, type ButtonProps } from "@mantine/core";
import { api } from "~/utils/api";

export default function ExportJSONButton(props: ButtonProps) {
  const context = api.useContext();
  const countries = api.countries.getExportJSON.useQuery(undefined, {
    enabled: false,
  });

  const download = async () => {
    const data = await context.countries.getExportJSON.fetch();

    const element = document.createElement("a");
    const file = new Blob([data.json], {
      type: "application/json",
    });
    element.href = URL.createObjectURL(file);
    element.download = "exported.json";
    document.body.appendChild(element);
    element.click();
    element.parentNode?.removeChild(element);
  };

  return (
    <Button
      loading={countries.isFetching}
      onClick={() => void download()}
      {...props}
    >
      Download JSON data
    </Button>
  );
}
