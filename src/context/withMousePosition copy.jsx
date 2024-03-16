import React, { useState, useEffect, useRef } from "react";
import { HightLightOnRender } from "./HightLightOnRender";

export function withMousePosition(Component) {
  return function WrappedComponent(props) {
    const [mousePosition, setMousePosition] = useState(null);
    const [canMove, setCanMove] = useState(false);
    const componentRef = useRef(null); // Créer une référence pour le composant

    useEffect(() => {
      const handleMouseMove = (event) => {
        if (canMove) {
          setMousePosition({
            x: event.clientX,
            y: event.clientY,
          });
        }
      };

      const mouseDown = (event) => {
        const c = componentRef.current;
        if (
          componentRef.current &&
          componentRef.current.contains(event.target)
        ) {
          console.log(
            "mouse Down : x:",
            c.offsetLeft,
            " y:",
            c.offsetTop,
            "composant : ",
            c
          );

          setCanMove(true);

          console.log("canMove:", canMove);
          document.removeEventListener("mousemove", handleMouseMove);
        }
      };

      const mouseUp = (event) => {
        if (
          componentRef.current &&
          componentRef.current.contains(event.target)
        ) {
          setCanMove(false);
          document.removeEventListener("mousemove", handleMouseMove);
        }
      };

      // Attachement conditionnel basé sur canMove
      if (canMove) {
        document.addEventListener("mousemove", handleMouseMove);
      }

      // Attacher l'écouteur d'événements click à l'élément référencé
      const currentComponent = componentRef.current;
      if (currentComponent) {
        currentComponent.addEventListener("mouseup", mouseUp);
        currentComponent.addEventListener("mousedown", mouseDown);
      }

      // Fonction de nettoyage pour retirer les écouteurs
      return () => {
        if (canMove) {
          document.removeEventListener("mousemove", handleMouseMove);
        }
        if (currentComponent) {
          currentComponent.removeEventListener("mouseup", mouseUp);
          currentComponent.removeEventListener("mousedown", mouseDown);
        }
      };
    }, [canMove]); // Dépendances de l'effet

    return (
      <div
        ref={componentRef}
        className="fixed border-2 border-primary bg-secondary"
      >
        <HightLightOnRender className="p-3">
          <Component
            {...props}
            // className="hover:cursor-move"
            mousePosition={mousePosition}
            style={{ position: "fixed", cursor: canMove ? "pointer" : "move" }}
          />
        </HightLightOnRender>
      </div>
    );
  };
}
