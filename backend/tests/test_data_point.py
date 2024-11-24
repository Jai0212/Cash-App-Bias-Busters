import pytest
from ml_model.entities.datapoint_entity import (
    DataPoint,
)


def test_get_feature1():
    """Test that get_feature1 returns the correct feature1 value."""
    data_point = DataPoint("FeatureA", "FeatureB", 0.95, 0.1, 0.05)
    assert data_point.get_feature1() == "FeatureA"


def test_get_feature2():
    """Test that get_feature2 returns the correct feature2 value."""
    data_point = DataPoint("FeatureA", "FeatureB", 0.95, 0.1, 0.05)
    assert data_point.get_feature2() == "FeatureB"


def test_get_accuracy():
    """Test that get_accuracy returns the correct accuracy value."""
    data_point = DataPoint("FeatureA", "FeatureB", 0.95, 0.1, 0.05)
    assert data_point.get_accuracy() == pytest.approx(0.95)


def test_get_false_positive_rate():
    """Test that get_false_positive_rate returns the correct false positive rate."""
    data_point = DataPoint("FeatureA", "FeatureB", 0.95, 0.1, 0.05)
    assert data_point.get_false_positive_rate() == pytest.approx(0.1)


def test_get_false_negative_rate():
    """Test that get_false_negative_rate returns the correct false negative rate."""
    data_point = DataPoint("FeatureA", "FeatureB", 0.95, 0.1, 0.05)
    assert data_point.get_false_negative_rate() == pytest.approx(0.05)


def test_get_combination_label():
    """Test that get_combination_label returns the correct combined label."""
    data_point = DataPoint("FeatureA", "FeatureB", 0.95, 0.1, 0.05)
    assert data_point.get_combination_label() == "FeatureA FeatureB"