class DataPoint:
    """
    A DataPoint entity that represents the core attributes and behaviors of a data point in the graph.
    """

    def __init__(
        self,
        feature1: str,
        feature2: str,
        accuracy: float,
        falsepositive: float,
        falsenegative: float,
    ):
        self.feature1 = feature1
        self.feature2 = feature2
        self.accuracy = accuracy
        self.falsepositive = falsepositive
        self.falsenegative = falsenegative

    # Getters
    def get_feature1(self) -> str:
        """Returns the first feature."""
        return self.feature1

    def get_feature2(self) -> str:
        """Returns the second feature."""
        return self.feature2

    def get_accuracy(self) -> float:
        """Returns the accuracy metric."""
        return self.accuracy

    def get_false_positive_rate(self) -> float:
        """Returns the false positive rate metric."""
        return self.falsepositive

    def get_false_negative_rate(self) -> float:
        """Returns the false negative rate metric."""
        return self.falsenegative

    def get_combination_label(self) -> str:
        """Returns the combined label."""
        return self.feature1 + " " + self.feature2
