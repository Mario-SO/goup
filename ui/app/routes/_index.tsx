import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "Uptime" },
    { name: "description", content: "Uptime checker" },
  ];
};

export default function Index() {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-900 font-mono">
      <div className="max-w-[800px] mx-auto p-4">
        <div className="mb-8 text-gray-400">
          <h1 className="text-lg uppercase tracking-wider font-normal">
            Streameth Uptime Monitor
          </h1>
        </div>

        <fieldset className="border border-gray-700 mb-4 bg-gray-800 p-2 rounded">
          <legend className="font-bold px-2 text-gray-400 uppercase text-sm tracking-wider">
            Production
          </legend>
          <div className="flex items-center p-2 text-sm">
            <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-3"></span>
            <span className="min-w-[200px]">
              <a 
                href="https://prod.api.streameth.org" 
                className="text-gray-200 no-underline hover:underline"
              >
                prod.api.streameth.org
              </a>
            </span>
            <span className="text-gray-400 text-sm ml-4 min-w-[60px]">234ms</span>
            <span className="text-gray-400 text-sm ml-auto">99.76%</span>
          </div>
        </fieldset>

        <fieldset className="border border-gray-700 mb-4 bg-gray-800 p-2 rounded">
          <legend className="font-bold px-2 text-gray-400 uppercase text-sm tracking-wider">
            Staging
          </legend>
          <div className="flex items-center p-2 text-sm">
            <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-3"></span>
            <span className="min-w-[200px]">
              <a 
                href="https://staging.api.streameth.org" 
                className="text-gray-200 no-underline hover:underline"
              >
                staging.api.streameth.org
              </a>
            </span>
            <span className="text-gray-400 text-sm ml-4 min-w-[60px]">312ms</span>
            <span className="text-gray-400 text-sm ml-auto">99.76%</span>
          </div>
        </fieldset>
      </div>
    </div>
  );
}
