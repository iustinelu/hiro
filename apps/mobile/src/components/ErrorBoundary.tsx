import React from "react";
import { View } from "react-native";
import { MobileErrorState } from "@hiro/ui-primitives/mobile";
import { tokens } from "@hiro/ui-tokens";

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            padding: tokens.spacing.lg,
            backgroundColor: tokens.color.bg
          }}
        >
          <MobileErrorState onRetry={this.handleRetry} />
        </View>
      );
    }
    return this.props.children;
  }
}
