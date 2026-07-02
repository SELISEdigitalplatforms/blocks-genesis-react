import { Card, CardHeader, CardTitle, CardContent } from "@/components/core";
import { InfoIcon } from "lucide-react";

export const CNameInstruction = ({
  cookieDomainName,
  customDomain,
}: {
  cookieDomainName: string;
  customDomain?: string;
}) => {
  const apiBaseUrl = "blocksapi." + cookieDomainName;
  return (
    <Card className="h-60 overflow-y-auto rounded-sm px-4 py-3 text-base font-normal text-high-emphasis shadow-none">
      <CardHeader className="p-0!">
        <CardTitle className="flex items-center gap-3 text-lg font-semibold">
          <InfoIcon className="h-6 w-6 text-neutral-300" />
          DNS CNAME Record for Domain Validation
        </CardTitle>
      </CardHeader>
      <CardContent className="my-2.5 p-0!">
        <div>
          <h4>
            Please add the following
            {cookieDomainName ? " two CNAME records" : " CNAME record"} to your
            DNS configuration to complete domain validation:
          </h4>
          {cookieDomainName && (
            <>
              <p className="mt-3 font-semibold">CNAME configuration 1</p>
              <ul className="mt-2 list-disc pl-5">
                <li>
                  Host:{" "}
                  <span className="font-semibold">
                    {customDomain?.split("//")[1]}
                  </span>
                </li>
                <li className="my-2">Type: CNAME</li>
                <li>
                  Value:{" "}
                  <span className="font-semibold">
                    blocksapi.seliseblocks.com
                  </span>
                </li>
              </ul>
              <p className="mt-3 font-semibold">CNAME configuration 2</p>
            </>
          )}
          <ul className="mt-2 list-disc pl-5">
            <li>
              Host: <span className="font-semibold">{apiBaseUrl}</span>
            </li>
            <li className="my-2">Type: CNAME</li>
            <li>
              Value:{" "}
              <span className="font-semibold">blocksapi.seliseblocks.com</span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
