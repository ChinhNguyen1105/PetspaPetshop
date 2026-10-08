export class BookingDetailDto {
  id: number;

  bookingId: number | null;
  serviceId: number | null;
  serviceName: string | null;
  servicePrice: number | null;
  serviceDuration: number | null;
}
