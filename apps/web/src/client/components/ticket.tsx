interface TicketProps {
	artist: string;
	collection: string;
	onClaimClick: () => void;
}
export function Ticket(props: TicketProps) {
	return (
		<div className="ticket">
			<div className="ticket-top">
				<div>
					<p className="font-bold">{props.artist}</p>
				</div>
				<div>
					<p>{props.collection}</p>
				</div>
				<div className="ticket-deetz" />
			</div>
			<div className="ticket-rip" />
			<div className="ticket-bottom">
				<div className="barcode" />
				<button type="button" className="buy" onClick={props.onClaimClick}>
					CLAIM
				</button>
			</div>
		</div>
	);
}
