type BadgeVariant = 'pending' | 'verified' | 'rejected' | 'low' | 'medium' | 'high';

const labels: Record<BadgeVariant, string> = {
  pending: 'На рассмотрении',
  verified: 'Подтверждено',
  rejected: 'Отклонено',
  low: 'Низкое',
  medium: 'Среднее',
  high: 'Высокое',
};

export default function Badge({ variant }: { variant: BadgeVariant }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium badge-${variant}`}
    >
      {labels[variant]}
    </span>
  );
}
