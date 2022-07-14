import { Params } from "@based/server";

export default async ({ based, payload, update }: Params) => {
  return based.observe(
    {
      $id: "root",
      events: {
        $all: true,
        $list: {
          $offset: 0,
          $limit: 100,
          $find: {
            $traverse: "descendants",
            $filter: [
              {
                $operator: "=",
                $value: "event",
                $field: "type",
              },
              {
                $operator: ">",
                $value: 90,
                $field: "relativehumidity",
              },
            ],
          },
        },
      },
    },
    update
  );
};

export const authorize = async () => {
  return true;
};
