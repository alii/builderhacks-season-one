interface TicketProps {
	artist: string;
	collection: string;
	claimText?: string;
	ticketsRemaining?: number;
	activityText?: string;
	image?: string;
	onClaimClick: () => void;
}
export function Ticket(props: TicketProps) {
	return (
		<div className="ticket">
			<div className="ticket-top">
				<div>
					{props.image && (
						<div
							className={'ticket-image'}
							style={{backgroundImage: `url(${props.image})`}}
						/>
					)}
					<p className="font-bold">{props.artist}</p>
				</div>
				<div>
					<p>{props.collection}</p>
				</div>
				<div className="ticket-deetz">
					{(props.ticketsRemaining ?? 0) > 0 && (
						<p>{props.ticketsRemaining} tickets left</p>
					)}

					{props.activityText && <p>{props.activityText}</p>}
				</div>
			</div>
			<div className="ticket-rip" />
			<div className="ticket-bottom">
				<div className="barcode" />
				<button type="button" className="buy" onClick={props.onClaimClick}>
					{props.claimText ?? 'CLAIM'}
				</button>
			</div>
		</div>
	);
}
