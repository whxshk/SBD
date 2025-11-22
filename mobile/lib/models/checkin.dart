/// CheckIn model representing a check-in event
class CheckIn {
  final String id;
  final String userId;
  final String cardId;
  final String businessId;
  final int pointsEarned;
  final DateTime timestamp;
  final String? location;
  final Map<String, dynamic>? metadata;
  final String? cardName;
  final String? cardLogo;

  CheckIn({
    required this.id,
    required this.userId,
    required this.cardId,
    required this.businessId,
    required this.pointsEarned,
    required this.timestamp,
    this.location,
    this.metadata,
    this.cardName,
    this.cardLogo,
  });

  factory CheckIn.fromJson(Map<String, dynamic> json) {
    return CheckIn(
      id: json['id'] as String,
      userId: json['userId'] as String,
      cardId: json['cardId'] as String,
      businessId: json['businessId'] as String,
      pointsEarned: json['pointsEarned'] as int,
      timestamp: DateTime.parse(json['timestamp'] as String),
      location: json['location'] as String?,
      metadata: json['metadata'] as Map<String, dynamic>?,
      cardName: json['cardName'] as String?,
      cardLogo: json['cardLogo'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'cardId': cardId,
      'businessId': businessId,
      'pointsEarned': pointsEarned,
      'timestamp': timestamp.toIso8601String(),
      'location': location,
      'metadata': metadata,
      'cardName': cardName,
      'cardLogo': cardLogo,
    };
  }
}

/// CheckInResponse model for check-in API response
class CheckInResponse {
  final CheckIn checkIn;
  final int totalPoints;
  final String message;

  CheckInResponse({
    required this.checkIn,
    required this.totalPoints,
    required this.message,
  });

  factory CheckInResponse.fromJson(Map<String, dynamic> json) {
    return CheckInResponse(
      checkIn: CheckIn.fromJson(json['checkIn'] as Map<String, dynamic>),
      totalPoints: json['totalPoints'] as int,
      message: json['message'] as String,
    );
  }
}
