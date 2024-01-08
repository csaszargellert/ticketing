import Link from 'next/link';

const OrderIndex = ({ orders }) => {
  return (
    <ul>
      {orders.map((order) => {
        return (
          <li key={order.id} className="mb-2 d-flex align-items-center gap-2">
            <p className="mb-0">
              {order.ticket.title} - {order.status}
            </p>
            {order.status !== 'order:complete' && (
              <Link
                href={`/orders/[orderId]`}
                as={`/orders/${order.id}`}
                className="btn btn-primary"
              >
                checkout
              </Link>
            )}
          </li>
        );
      })}
    </ul>
  );
};

OrderIndex.getInitialProps = async (context, client) => {
  const { data } = await client.get('/api/orders');

  return { orders: data };
};

export default OrderIndex;
