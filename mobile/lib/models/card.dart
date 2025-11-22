/// Card model representing a loyalty/access card
class CardModel {
  final String id;
  final String businessId;
  final String name;
  final String? description;
  final String? logo;
  final String? backgroundColor;
  final bool isActive;
  final Map<String, dynamic>? metadata;
  final DateTime createdAt;
  final DateTime updatedAt;

  CardModel({
    required this.id,
    required this.businessId,
    required this.name,
    this.description,
    this.logo,
    this.backgroundColor,
    required this.isActive,
    this.metadata,
    required this.createdAt,
    required this.updatedAt,
  });

  factory CardModel.fromJson(Map<String, dynamic> json) {
    return CardModel(
      id: json['id'] as String,
      businessId: json['businessId'] as String,
      name: json['name'] as String,
      description: json['description'] as String?,
      logo: json['logo'] as String?,
      backgroundColor: json['backgroundColor'] as String?,
      isActive: json['isActive'] as bool,
      metadata: json['metadata'] as Map<String, dynamic>?,
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'businessId': businessId,
      'name': name,
      'description': description,
      'logo': logo,
      'backgroundColor': backgroundColor,
      'isActive': isActive,
      'metadata': metadata,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }
}

/// UserCard model representing a card in user's wallet
class UserCard {
  final String id;
  final String userId;
  final String cardId;
  final DateTime addedAt;
  final DateTime? lastCheckIn;
  final CardModel? card;

  UserCard({
    required this.id,
    required this.userId,
    required this.cardId,
    required this.addedAt,
    this.lastCheckIn,
    this.card,
  });

  factory UserCard.fromJson(Map<String, dynamic> json) {
    return UserCard(
      id: json['id'] as String,
      userId: json['userId'] as String,
      cardId: json['cardId'] as String,
      addedAt: DateTime.parse(json['addedAt'] as String),
      lastCheckIn: json['lastCheckIn'] != null
          ? DateTime.parse(json['lastCheckIn'] as String)
          : null,
      card: json['card'] != null
          ? CardModel.fromJson(json['card'] as Map<String, dynamic>)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'cardId': cardId,
      'addedAt': addedAt.toIso8601String(),
      'lastCheckIn': lastCheckIn?.toIso8601String(),
      'card': card?.toJson(),
    };
  }
}
