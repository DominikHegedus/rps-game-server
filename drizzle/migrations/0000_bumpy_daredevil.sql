CREATE TABLE "games" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"player1_id" text NOT NULL,
	"player2_id" text NOT NULL,
	"player1_move" text,
	"player2_move" text,
	"winner_id" text,
	"result" text,
	"played_at" timestamp with time zone DEFAULT now()
);
