import Nat "mo:base/Nat";

import Array "mo:base/Array";
import Int "mo:base/Int";
import Iter "mo:base/Iter";

actor {
  stable var highScores : [Int] = [];

  public func addScore(score : Int) : async () {
    highScores := Array.sort(Array.append(highScores, [score]), Int.compare);
    if (highScores.size() > 5) {
      highScores := Array.tabulate(5, func (i : Nat) : Int { highScores[i] });
    };
  };

  public query func getHighScores() : async [Int] {
    Array.reverse(highScores)
  };
}
