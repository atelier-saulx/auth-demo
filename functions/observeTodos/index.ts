import { Params } from "@based/server";

export default async function ({ based, payload, update }: Params) {
  return based.observe(
    {
      $id: payload.id,
      todos: {
        id: true,
        done: true,
        name: true,
        createdAt: true,
        description: true,
        $list: {
          $sort: {
            $field: "createdAt",
            $order: "asc",
          },
          $limit: 100,
          $offset: 0,
          $find: {
            $traverse: "children",
            $filter: payload.filter,
          },
        },
      },
    },
    update
  );
}
